Rails.application.routes.draw do
  devise_for :users

  root 'home#index'

  resources :schools, only: [:new, :create]
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
end
