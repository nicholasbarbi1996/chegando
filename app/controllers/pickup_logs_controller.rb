class PickupLogsController < ApplicationController

  before_action :set_school_id

  def index
    pickups = PickupLog.joins(:school_gate).where(school_gates: {school_id: @school_id})
    render json: pickups
  end

  private
  def set_school_id
    @school_id = params[:school_id]
  end

end

