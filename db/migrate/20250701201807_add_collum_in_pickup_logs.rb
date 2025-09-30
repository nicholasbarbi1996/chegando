class AddCollumInPickupLogs < ActiveRecord::Migration[7.0]
  def change
    add_column :pickup_logs, :released_at, :timestamp
  end
end
