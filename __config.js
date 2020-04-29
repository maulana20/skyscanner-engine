var config = {}

config.development = {}
config.development.host = "127.0.0.1"
config.development.port = 1501
config.development.request_headers = {
    'x-rapidapi-host': 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com',
    'x-rapidapi-key': '99a5d9459cmsh79fd64ce15aad2ap10efcdjsnbbe97d63e5f6',
    'content-type': 'application/x-www-form-urlencoded'
}
config.development.trusted_agents = [1920937, 2583724, 3950295, 2584453, 3166943, 4040229, 4260942]
config.development.included_carriers = [1626, 914, 1121, 1284, 0, 1714, 1220, 1426, 1239, 39]
config.development.allow_ips = ["127.0.0.1"]

config.production = {}
config.production.host = "127.0.0.1"
config.production.port = 1501
config.production.request_headers = {
    'x-rapidapi-host': 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com',
    'x-rapidapi-key': '99a5d9459cmsh79fd64ce15aad2ap10efcdjsnbbe97d63e5f6',
    'content-type': 'application/x-www-form-urlencoded'
}
config.production.trusted_agents = [1920937, 2583724, 3950295, 2584453, 3166943, 4040229, 4260942]
config.production.included_carriers = [1626, 914, 1121, 1284, 0, 1714, 1220, 1426, 1239, 39]
config.production.allow_ips = ["127.0.0.1"]

module.exports = config