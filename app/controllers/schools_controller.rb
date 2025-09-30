class SchoolsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:create]
  def new
    response.headers.delete('X-Frame-Options')
    @school = School.new(
      agendaedu_id: params[:agendaedu_id],
      name: params[:name]
    )
  end

  def create
    @school = School.new(school_params)
    if @school.save
      redirect_to root_path, notice: "Escola cadastrada com sucesso!"
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def school_params
    params.require(:school).permit(:agendaedu_id, :name, :agendaedu_token)
  end
end