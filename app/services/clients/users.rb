require 'net/http'
require 'json'
require 'uri'

class Clients::Users
  API_URL = "http://localhost:3000/v2/"

  def initialize(aetoken)
    @aetoken = aetoken
  end


  def conn
    @conn ||= Faraday.new(url: API_URL) do |f|
      f.request :url_encoded
      f.headers['Content-Type'] = 'application/json'
      f.headers['Authorization'] = "Bearer #{@aetoken}"
      f.headers['Accept'] = 'application/json'
      f.adapter Faraday.default_adapter
    end
  end
  def fetch_user_data
    response = conn.get('me')
    Rails.logger.debug "Erro ao buscar: status #{response.status} | body: #{response.body}"

    if response.status == 200
      JSON.parse(response.body)
    else
      nil
    end
  end

  def self.call(aetoken)
    new(aetoken).fetch_user_data
  end

end