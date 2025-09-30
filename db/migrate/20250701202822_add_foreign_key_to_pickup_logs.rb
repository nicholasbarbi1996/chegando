class AddForeignKeyToPickupLogs < ActiveRecord::Migration[7.0]
  def change
    add_foreign_key :pickup_logs, :users, column: :student_id
    add_foreign_key :pickup_logs, :users, column: :user_id
    add_foreign_key :pickup_logs, :users, column: :released_by_id
  end
end
