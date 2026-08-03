export default function PropertyCard({ property, showImageLabels = true }) {
  return (
    <article className="propertyCard">
      <a href={property.link} className="propertyCardImageLink">
        <div
          className="propertyCardImage"
          style={{
            backgroundImage: `url("${property.image}")`,
          }}
        >
          <div className="propertyCardOverlay" />

          {showImageLabels && property.collection && (
            <span className="propertyCardCollection">
              {property.collection}
            </span>
          )}

          {showImageLabels && property.status && (
            <span className="propertyCardStatus">{property.status}</span>
          )}

          <span className="propertyCardExplore">View property →</span>
        </div>
      </a>

      <div className="propertyCardContent">
        <div className="propertyCardLocation">
          <span>{property.location}</span>
        </div>

        <h3>{property.title}</h3>

        <div className="propertyCardDetails">
          {property.bedrooms && <span>{property.bedrooms}</span>}
          {property.bathrooms && <span>{property.bathrooms}</span>}
          {property.area && <span>{property.area}</span>}
        </div>

        <p>{property.description}</p>

        <div className="propertyCardFooter">
          <div>
            <small>{property.priceLabel || "Price"}</small>
            <strong>{property.price}</strong>
          </div>

          <a href={property.link}>Explore →</a>
        </div>
      </div>
    </article>
  );
}