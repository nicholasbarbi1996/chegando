class AddIndexToUsers < ActiveRecord::Migration[7.0]
  def change
    add_index :users, :username, unique: true
    add_index :users, :school_id
    add_index :users, :agendaedu_id
  end
end
