import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const filePath = path.resolve("src/lib/data.ts");
const sourceText = fs.readFileSync(filePath, "utf8");
const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const declarations = new Map();

function visit(node) {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
    declarations.set(node.name.text, node.initializer);
  }
  ts.forEachChild(node, visit);
}

visit(sourceFile);

function unwrap(expression) {
  if (ts.isAsExpression(expression) || ts.isSatisfiesExpression(expression) || ts.isParenthesizedExpression(expression)) {
    return unwrap(expression.expression);
  }
  return expression;
}

function literalString(node) {
  const value = unwrap(node);
  return ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value) ? value.text : undefined;
}

function literalNumber(node) {
  const value = unwrap(node);
  if (ts.isNumericLiteral(value)) return Number(value.text);
  if (ts.isPrefixUnaryExpression(value) && value.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(value.operand)) {
    return -Number(value.operand.text);
  }
  return undefined;
}

function arrayInitializer(name) {
  const initializer = unwrap(declarations.get(name));
  if (ts.isArrayLiteralExpression(initializer)) return initializer;
  if (ts.isCallExpression(initializer) && ts.isPropertyAccessExpression(initializer.expression)) {
    const target = unwrap(initializer.expression.expression);
    if (ts.isArrayLiteralExpression(target)) return target;
  }
  throw new Error(`Could not read ${name} as an array`);
}

function objectKeys(name) {
  const initializer = unwrap(declarations.get(name));
  if (!ts.isObjectLiteralExpression(initializer)) throw new Error(`Could not read ${name} as an object`);
  return new Set(initializer.properties.flatMap((property) => {
    if (!ts.isPropertyAssignment(property)) return [];
    const key = ts.isIdentifier(property.name) || ts.isStringLiteral(property.name) ? property.name.text : undefined;
    return key ? [key] : [];
  }));
}

const genreNames = new Set(arrayInitializer("genres").elements.map(literalString).filter(Boolean));
const publicationLabels = objectKeys("publicationLabels");
const verifiedTitles = objectKeys("verifiedEditorialContext");
const verifiedIdeaTitles = objectKeys("verifiedIdeaSeeds");
const books = arrayInitializer("bookRows").elements.map((element, index) => {
  const row = unwrap(element);
  if (!ts.isArrayLiteralExpression(row) || row.elements.length !== 4) throw new Error(`Malformed book row ${index + 1}`);
  const genres = unwrap(row.elements[3]);
  if (!ts.isArrayLiteralExpression(genres)) throw new Error(`Malformed genre list on row ${index + 1}`);
  return {
    title: literalString(row.elements[0]),
    author: literalString(row.elements[1]),
    year: literalNumber(row.elements[2]),
    genres: genres.elements.map(literalString).filter(Boolean)
  };
});

const errors = [];
const warnings = [];
const seenTitles = new Set();

for (const [index, book] of books.entries()) {
  if (!book.title || !book.author || book.year === undefined || book.genres.length === 0) errors.push(`Row ${index + 1} is incomplete`);
  if (seenTitles.has(book.title)) errors.push(`Duplicate title: ${book.title}`);
  seenTitles.add(book.title);
  for (const genre of book.genres) if (!genreNames.has(genre)) errors.push(`${book.title} uses unknown genre: ${genre}`);
  if (book.year < 1000 && !publicationLabels.has(book.title)) errors.push(`${book.title} needs a human-readable historical date label`);
}

for (const title of verifiedTitles) {
  if (!seenTitles.has(title)) errors.push(`Reviewed context has no catalog book: ${title}`);
  if (!verifiedIdeaTitles.has(title)) errors.push(`Reviewed book has no book-specific ideas: ${title}`);
}

for (const title of verifiedIdeaTitles) if (!verifiedTitles.has(title)) errors.push(`Book-specific ideas lack reviewed context: ${title}`);

for (const genre of genreNames) {
  const count = books.filter((book) => book.genres.includes(genre)).length;
  if (count < 10) warnings.push(`${genre} has only ${count} books; launch target is at least 20 placements`);
}

if (/discussionCount:\s*\d*[1-9]/.test(sourceText) || /recommendationYesCount:\s*\d*[1-9]/.test(sourceText)) {
  errors.push("Synthetic book engagement counts are present");
}

console.log(`Catalog titles: ${books.length}`);
console.log(`Reading rooms: ${genreNames.size}`);
console.log(`Source-reviewed previews: ${verifiedTitles.size}`);
warnings.forEach((warning) => console.warn(`Warning: ${warning}`));

if (errors.length) {
  errors.forEach((error) => console.error(`Error: ${error}`));
  process.exitCode = 1;
} else {
  console.log("Content integrity checks passed.");
}
