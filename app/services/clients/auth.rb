require 'net/http'
require 'uri'
require 'json'

class Clients::Auth
  AUTH_URL = "https://api.agendaedu.com/oauth/v2/token"

  def initialize(client_id:, client_secret:)
    @client_id = client_id
    @client_secret = client_secret
  end

  def conn
    conn = Faraday.new(url: AUTH_URL) do |f|
      f.request :url_encoded
      f.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      f.headers['Accept'] = 'application/json'
      f.adapter Faraday.default_adapter
    end

    response = conn.post do |req|
      req.body = {
        grant_type: 'client_credentials',
        client_id: @client_id,
        client_secret: @client_secret
      }
    end

    if response.success?
      JSON.parse(response.body)
    else
      raise "Erro na autenticação: #{response.status} - #{response.body}"
    end
  end
end
