class CreateSchoolGates < ActiveRecord::Migration[7.0]
  def change
    create_table :school_gates do |t|
      t.string :name
      t.integer :school_id
      t.string :start_hour
      t.string :end_hour

      t.timestamps
    end
  end
end
