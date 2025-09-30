# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2025_07_01_210556) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "family_users", force: :cascade do |t|
    t.string "name"
    t.bigint "school_id", null: false
    t.integer "kinship"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["school_id"], name: "index_family_users_on_school_id"
    t.index ["user_id"], name: "index_family_users_on_user_id"
  end

  create_table "pickup_logs", force: :cascade do |t|
    t.bigint "school_gate_id", null: false
    t.bigint "family_user_id", null: false
    t.bigint "student_id"
    t.string "student_name"
    t.bigint "user_id"
    t.datetime "requested_at"
    t.bigint "released_by_id"
    t.bigint "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "released_at", precision: nil
    t.index ["family_user_id"], name: "index_pickup_logs_on_family_user_id"
    t.index ["school_gate_id"], name: "index_pickup_logs_on_school_gate_id"
  end

  create_table "school_gates", force: :cascade do |t|
    t.string "name"
    t.integer "school_id"
    t.string "start_hour"
    t.string "end_hour"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "schools", force: :cascade do |t|
    t.integer "agendaedu_id"
    t.string "name"
    t.string "agendaedu_token"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "username"
    t.integer "role"
    t.integer "agendaedu_id"
    t.integer "school_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["agendaedu_id"], name: "index_users_on_agendaedu_id"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["school_id"], name: "index_users_on_school_id"
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "family_users", "schools"
  add_foreign_key "family_users", "users"
  add_foreign_key "pickup_logs", "family_users"
  add_foreign_key "pickup_logs", "school_gates"
  add_foreign_key "pickup_logs", "users"
  add_foreign_key "pickup_logs", "users", column: "released_by_id"
  add_foreign_key "pickup_logs", "users", column: "student_id"
end
