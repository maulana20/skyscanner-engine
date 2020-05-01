class mapping {
	constructor(res) {
		this.res = res
	}
	
	getFlightQuotes()
	{
		const result = []
		const list = this.res
		
		if (list.Quotes.length > 1) {
			list.Quotes.forEach(val => {
				const flight = getFilter(list.Carriers, 'CarrierId', val.OutboundLeg.CarrierIds[0])[0].Name
				const route = getFilter(list.Places, 'PlaceId', val.OutboundLeg.OriginId)[0].IataCode + '-' + getFilter(list.Places, 'PlaceId', val.OutboundLeg.DestinationId)[0].IataCode
				const data = {
					id: val.QuoteId,
					flight: flight,
					route: route,
					time_depart: val.OutboundLeg.DepartureDate,
					price: val.MinPrice
				}
				
				result.push(data)
			})
		}
		
		return result
	}
}

function getFilter(res, index, value)
{
	return res.filter(data => data[index] === value)
}

module.exports = { mapping }
