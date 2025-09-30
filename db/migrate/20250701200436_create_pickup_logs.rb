class CreatePickupLogs < ActiveRecord::Migration[7.0]
  def change
    create_table :pickup_logs do |t|
      t.references :school_gate, null: false, foreign_key: true
      t.references :family_user, null: false, foreign_key: true
      t.bigint :student_id
      t.string :student_name
      t.bigint :user_id
      t.datetime :requested_at
      t.bigint :released_by_id
      t.bigint :status

      t.timestamps
    end
  end
end
