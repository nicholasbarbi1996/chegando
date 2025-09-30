class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         authentication_keys: [:username]

  belongs_to :school
  has_many :family_users
  has_many :pickup_logs



  enum role: {
    responsible: 0,
    master: 1,
    manager: 2,
    coordinator: 3,
    secretariat: 4,
    teacher: 5,
    assistant: 6,
    financial: 7,
    financial_assistant: 8
  }

  validates :role, presence: true

  def self.build_responsible_username(username)
    "responsible-#{username}"
  end

  def self.build_schooluser_username(schooluser_id)
    "schooluser-#{schooluser_id}"
  end
end
