Rails.application.routes.draw do
  get 'hello_world', to: 'hello_world#index'
  devise_for :users

  root 'home#index'
  resources :schools, only: [:new, :create]
  resources :pickup_logs, only: [:index]
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  namespace :api do
    resources :gates, only: [:index]
  end
  # Defines the root path route ("/")
  # root "articles#index"
end
