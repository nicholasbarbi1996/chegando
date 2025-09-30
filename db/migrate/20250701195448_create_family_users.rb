class CreateFamilyUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :family_users do |t|
      t.string :name
      t.references :school, null: false, foreign_key: true
      t.integer :kinship
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
