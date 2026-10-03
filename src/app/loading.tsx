// A shimmering grey mock-up of a page that has not arrived is the one piece of motion every
// generated app has, and it lies about the layout as often as not. This says the true thing
// in the label face and gets out of the way.
export default function Loading() {
  return (
    <div className="editorial-page" role="status">
      <p className="caption caption-muted">Loading</p>
      <span className="sr-only">Loading BookSphere</span>
    </div>
  );
}
