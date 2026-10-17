import Link from "next/link";
import { ArtCanvas } from "@/components/ArtCanvas";
import { Crawl } from "@/components/Crawl";
import { Guide } from "@/components/Guide";
import { HeroTV } from "@/components/HeroTV";
import { Monitor } from "@/components/Monitor";
import { ARTWORKS, ROOMS } from "@/lib/catalog";

export default function Lobby() {
  return (
    <>
      <section className="hero wrap">
        <HeroTV />
        <div className="hero-copy">
          <p className="eyebrow">Welcome to 444 · CH 01 · Open all night</p>
          <h1 className="display hero-title">A museum of broadcast art</h1>
          <p className="lede">
            Twelve works made for the television screen, from engineers&rsquo; test cards to holiday tapes that were
            nearly recorded over. Walk the rooms on channel 2. Take a print home from channel 3.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/gallery">
              <span className="btn-ch">02</span>Enter the gallery
            </Link>
            <Link className="btn" href="/shop">
              <span className="btn-ch">03</span>Shop prints and merch
            </Link>
          </div>
          <dl className="facts">
            <div>
              <dt>Hours</dt>
              <dd>24 hours, signal permitting</dd>
            </div>
            <div>
              <dt>Admission</dt>
              <dd>Free. Prints from $45</dd>
            </div>
            <div>
              <dt>Collection</dt>
              <dd>12 works in 4 rooms, 1979–1994</dd>
            </div>
          </dl>
        </div>
      </section>

      <Crawl
        label="Bulletin"
        items={[
          "Afterglow No. 7 is back in Night Programming after restoration",
          "Free standard shipping on orders over $75",
          "New in the shop: Sign-Off, Artist Tapes Vol. 1 on VHS",
          "Snow Study with Ghost is best viewed with the lights off",
          "Press 1 to 4 on your keyboard to change channel",
        ]}
      />

      <section className="wrap section" aria-labelledby="guide-h">
        <header className="section-head">
          <h2 id="guide-h" className="display h2">
            Tonight&rsquo;s programme
          </h2>
          <p>Each half hour, one work takes the main screen in the lobby. Times are in your local time zone.</p>
        </header>
        <Guide />
      </section>

      <section className="wrap section" aria-labelledby="rooms-h">
        <header className="section-head">
          <h2 id="rooms-h" className="display h2">
            The rooms
          </h2>
          <p>Four rooms on channel 2, three works in each.</p>
        </header>
        <ul className="rooms">
          {ROOMS.map((room) => {
            const works = ARTWORKS.filter((a) => a.room === room.id);
            const lead = works[0];
            return (
              <li key={room.id}>
                <Link href={`/gallery?room=${room.id}`} className="room-card">
                  <Monitor osd={`${works.length} works`}>
                    <ArtCanvas generator={lead.generator} seed={lead.seed} label={`${lead.title}, shown in ${room.name}`} />
                  </Monitor>
                  <span className="room-name">{room.name}</span>
                  <span className="room-blurb">{room.blurb}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
