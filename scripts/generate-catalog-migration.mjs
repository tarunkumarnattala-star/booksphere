import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const dataPath = path.resolve("src/lib/data.ts");
const outputPath = process.argv[2] ? path.resolve(process.argv[2]) : null;
const sourceText = fs.readFileSync(dataPath, "utf8");
const sourceFile = ts.createSourceFile(dataPath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const declarations = new Map();

function visit(node) {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
    declarations.set(node.name.text, node.initializer);
  }
  ts.forEachChild(node, visit);
}

function unwrap(node) {
  if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node)) {
    return unwrap(node.expression);
  }
  return node;
}

function arrayInitializer(name) {
  const initializer = unwrap(declarations.get(name));
  if (ts.isArrayLiteralExpression(initializer)) return initializer;
  if (ts.isCallExpression(initializer) && ts.isPropertyAccessExpression(initializer.expression)) {
    const target = unwrap(initializer.expression.expression);
    if (ts.isArrayLiteralExpression(target)) return target;
  }
  throw new Error(`Could not read ${name}`);
}

function quote(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function numberValue(node) {
  const value = unwrap(node);
  if (ts.isNumericLiteral(value)) {
    return Number(value.text);
  }
  if (
    ts.isPrefixUnaryExpression(value) &&
    value.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(value.operand)
  ) {
    return -Number(value.operand.text);
  }
  throw new Error(`Expected a numeric publication year, received ${value.getText(sourceFile)}`);
}

visit(sourceFile);

const genreNames = arrayInitializer("genres").elements.map((element) => element.text);
const books = arrayInitializer("bookRows").elements.map((element) => ({
  title: element.elements[0].text,
  author: element.elements[1].text,
  year: numberValue(element.elements[2]),
  genres: element.elements[3].elements.map((genre) => genre.text)
}));

const genreValues = genreNames.map((name) => `  (${quote(name)}, ${quote(slugify(name))})`).join(",\n");
const catalogValues = books.map((book) => `  (${quote(book.title)}, ${quote(book.author)}, ${book.year})`).join(",\n");
const mappingValues = books.flatMap((book) => book.genres.map((genre) => `  (${quote(book.title)}, ${quote(genre)})`)).join(",\n");

const sql = `begin;

insert into public.genres (name, slug)
values
${genreValues}
on conflict (slug) do update set name = excluded.name;

with catalog(title, author, published_year) as (
  values
${catalogValues}
)
insert into public.books (
  title,
  author,
  published_year,
  description,
  why_matters,
  why_it_matters,
  discussion_count,
  insight_count,
  readers_count
)
select
  catalog.title,
  catalog.author,
  catalog.published_year,
  catalog.title || ' by ' || catalog.author || ' is cataloged on BookSphere for reader perspectives and book-specific discussion.',
  'Use reader perspectives to understand what people took from this book and decide whether it deserves your full attention.',
  'Use reader perspectives to understand what people took from this book and decide whether it deserves your full attention.',
  0,
  0,
  0
from catalog
where not exists (
  select 1
  from public.books existing
  where lower(existing.title) = lower(catalog.title)
);

with mappings(title, genre_name) as (
  values
${mappingValues}
)
insert into public.book_genres (book_id, genre_id)
select books.id, genres.id
from mappings
join public.books books on lower(books.title) = lower(mappings.title)
join public.genres genres on genres.name = mappings.genre_name
on conflict do nothing;

commit;
`;

if (outputPath) {
  fs.writeFileSync(outputPath, sql);
  console.log(`Wrote ${outputPath}`);
} else {
  process.stdout.write(sql);
}
