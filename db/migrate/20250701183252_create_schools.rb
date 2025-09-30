class CreateSchools < ActiveRecord::Migration[7.0]
  def change
    create_table :schools do |t|
      t.integer :agendaedu_id
      t.string :name
      t.string :agendaedu_token

      t.timestamps
    end
  end
end
