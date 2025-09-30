require 'net/http'
require 'uri'
require 'json'

class Clients::Responsibles
  API_URL = "https://api.agendaedu.com/v2/responsible_profiles"

  def initialize(authtoken, school_token)
    @authtoken = authtoken
    @school_token = school_token
  end

  def fetch_students(responsible_id)
    url = URI("#{API_URL}/#{responsible_id}")
    req = Net::HTTP::Get.new(url)
    req["Authorization"] = "Bearer #{@authtoken}"
    req["x-school-token"] = @school_token
    req["Accept"] = "application/json"

    res = Net::HTTP.start(url.hostname, url.port, use_ssl: url.scheme == 'https') do |http|
      http.request(req)
    end

    Rails.logger.debug "Resposta do responsible_profile: #{res.code}"

    if res.is_a?(Net::HTTPSuccess)
      JSON.parse(res.body)
    else
      nil
    end
  end
end
