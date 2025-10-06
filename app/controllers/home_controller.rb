require 'pry'
class HomeController < ApplicationController

  def index
    response.headers.delete('X-Frame-Options')
    token = params[:aetoken]
    response = Clients::Users.call(token)
    unless response
      render plain: "Erro ao buscar dados do usuário", status: :unauthorized
      return
    end

    user = find_or_create_user(response)

    @school_id = response["data"]["relationships"]["school"]["data"]["id"]

    if user == :school_not_found
      redirect_to new_school_path(
         agendaedu_id: response["data"]["relationships"]["school"]["data"]["id"],
         name: response["data"]["attributes"]["school_name"],
         alert: "Cadastre a escola para continuar."
      )
      return
    end

    sign_in(user)

    case user.role
    when "responsible"
      @students = fetch_students_for_responsible
      render :responsible_index
    when "master"
      render :index
    else
      redirect_to root_path, alert: "Acesso negado para seu perfil."
    end
  end

    private

    def authtoken
      @auth_token ||= Auth.new(
        client_id: ENV.fetch["AGENDAEDU_CLIENT_ID"],
        client_secret: ENV.fetch["AGENDAEDU_CLIENT_SECRET"]
      ).conn
    end

    def school_token
      ENV.fetch["X_SCHOOL_TOKEN"]
    end

    def find_or_create_user(response)
      role = response.dig("data", "attributes", "role")
      user_id = response.dig("data", "id")
      email = response.dig("data", "attributes", "email")
      school_id = response.dig("data", "attributes", "school_id")

      username = if role == "responsible"
         User.build_responsible_username(user_id)
      else
         User.build_schooluser_username(user_id)
      end

      school = School.find_by(agendaedu_id: school_id)

      if school.nil? && role == "master"
        return :school_not_found
      end

      user = User.find_or_initialize_by(email: email)
      user.assign_attributes(
        role: role,
        agendaedu_id: user_id,
        username: username,
        school_id: school.id
      )
      user.password = SecureRandom.hex(10) if user.new_record?
      user.save!
      user
    end

    def fetch_students_for_responsible
      Clients::Responsibles
        .new(auth_token, school_token)
        .fetch_students(current_user.external_id)
        .dig("data", "relationships", "students", "data") || []
    end
end

