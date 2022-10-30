const Location = ({location,state,functions}) => {

    return (
        <details className={`location`}>
            <summary className={`locationName`}>{`${location.name}`}</summary>
            <address>{`${location.address.addressLine1}`} <br/>
            {`${location.address.city}, ${location.address.state} ${location.address.zipCode}`}
            </address>
            <button onClick={() => {functions.setUserLocation(location)}}>Set as your location</button>
        </details>
    )
}

export default Location