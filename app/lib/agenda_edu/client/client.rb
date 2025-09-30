# frozen_string_literal: true
module AgendaEdu
  class Client
    attr_reader :base_url, :token

    def initialize(base_url: , token:)
      @base_url = base_url
      @token = token
    end
  end
end