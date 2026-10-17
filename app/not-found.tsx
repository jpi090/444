import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap page">
      <div className="nosignal nosignal-full">
        <div className="nosignal-bars" aria-hidden="true">
          <i /><i /><i /><i /><i /><i /><i />
        </div>
        <div className="nosignal-box">
          <p className="nosignal-head">No signal</p>
          <p>Nothing is broadcasting on this channel. The page may have moved, or the address has a typo.</p>
          <div className="hero-actions">
            <Link href="/" className="btn btn-primary">
              <span className="btn-ch">01</span>Return to the lobby
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
