class PickupLog < ApplicationRecord
  belongs_to :school_gate
  belongs_to :family_user
  belongs_to :student, class_name: 'User', foreign_key: :student_id
  belongs_to :released_by, class_name: 'User', foreign_key: :released_by_id


  enum status: { solicitado: 0, liberado: 1, cancelado: 2 }
end
