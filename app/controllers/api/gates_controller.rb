# app/controllers/api/gates_controller.rb
module Api
  class Api::GatesController < ApplicationController
    def index
      binding.pry
      gates = SchoolGate.select(:id, :name)
      render json: gates
    end
  end
end