class FamilyUser < ApplicationRecord
  belongs_to :school
  belongs_to :user

  enum kinship: {father: 0, mother: 1, uncle: 2, other: 3}
end
