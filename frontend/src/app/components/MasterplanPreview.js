export default function MasterplanPreview() {
  return (
    <section className="masterplanSection" id="location">
      <div className="oniriaLocationSection" aria-labelledby="oniria-location-title">
        <div className="oniriaLocationIntro">
          <h2 id="oniria-location-title">Location</h2>

          <p>
            Set in Fumba, Zanzibar, ONIRIA City offers a peaceful island setting
            with convenient access to everyday services, the coast and the wider
            Zanzibar community. It is a place designed for connected living,
            growth and a relaxed way of life.
          </p>
        </div>

        <div className="oniriaMapFrame">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.6007457420783!2d39.28316122430025!3d-6.316060961806015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x185ce07ff3ad6a97%3A0x94d00c0e4a5e8911!2sFumba!5e0!3m2!1sen!2stz!4v1785716668495!5m2!1sen!2stz"
            title="Map showing Fumba, Zanzibar"
            loading="lazy"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </section>
  );
}
