class Apps::PackagesController < ApplicationController

	before_action :find_app

	before_action :set_settings_navigator, only: [:new, :create, :update, :edit]

	def index
	end

	def show
	end

	def new
		@app_package = current_agent.app_packages.new
	end

	def edit
		@app_package = current_agent.app_packages.find(params[:id])
	end

	def create
		resource_params = params.require(:app_package).permit( 
			:name,
			:description,
			:published,
			:oauth_url,
			:initialize_url,
			:configure_url,
			:submit_url,
			:sheet_url,
			capability_list: []
		)

		@app_package = current_agent.app_packages.create(resource_params)

		if @app_package.errors.blank?
			flash.now[:notice] = "Place was updated!"
			redirect_to app_integrations_path(@app.key, kind: :yours)
		else
			render "new", status: 422
		end
	end

	def update
		@app_package = current_agent.app_packages.find(params[:id])
		resource_params = params.require(:app_package).permit( 
			:name,
			:description,
			:published,
			:oauth_url,
			:initialize_url,
			:configure_url,
			:submit_url,
			:sheet_url,
			capability_list: []
		)

		if @app_package.update(resource_params)
			flash.now[:notice] = "Place was updated!"
			redirect_to app_integrations_path(@app.key, kind: :yours)
		else
			render "edit", status: 422
		end
	end

	def destroy
		@app_package = current_agent.app_packages.find(params[:id])
		if @app_package.destroy
			flash.now[:notice] = "Place was updated!"
			redirect_to app_integrations_path(@app.key, kind: :yours)
		else
			render "new", status: 422
		end
	end

	def capabilities
		@location = params[:kind]
		@packages = @app.app_package_integrations
		.joins(:app_package)
		.where(
			app_package_id: @app.app_packages.tagged_with(params[:kind], on: "capabilities")
		).order("app_packages.name desc")
	end

	def configure
		@package = get_app_package
		@package_name = params[:id]
		@location = params[:location] || params.dig(:ctx, :location)

		@blocks = @package.call_hook({
			kind: 'configure',
			ctx: {
					lang: I18n.locale,
					current_user: current_agent,
					field: params.dig(:ctx,:field)
				}
		})

		case @blocks[:kind]
		when "configure"
			render turbo_stream: turbo_stream.replace(
				"modal", 
				template: "apps/packages/configure", 
			), status: 202
		when "initialize"
			return process_initialize
		else
		end
	end

	def content
		@package = get_app_package
		@package_name = params[:id]
		@conversation_key = params[:conversation_key]

		@blocks = @package.call_hook({
			kind: 'content',
			ctx: {
				  values: params[:values],
					lang: I18n.locale,
					current_user: current_agent,
					conversation_key: params[:conversation_key]
				}
		})

		render template: "apps/packages/content", layout: false
	end

	def submit
		@package = get_app_package
		@package_name = params[:id]
		@conversation_key = params[:ctx][:conversation_key]
		

		@blocks = @package.call_hook({
			kind: 'submit',
			ctx: {
				  values: params[:values],
					lang: I18n.locale,
					current_user: current_agent,
					field: params[:ctx][:field],
					values: params[:ctx][:values],
					conversation_key: params[:ctx][:conversation_key]
				}
		})

		render template: "apps/packages/content", layout: false
	end

	def process_initialize
		@location = params.dig(:ctx, :location) || params[:location]
		case @location
		when "inbox"

			@app.inbox_apps <<  {
				"hooKind"=>"initialize",
				"definitions": @blocks[:definitions],
				"values"=> @blocks[:values],
				"id"=> @package.id,
				"name"=> @package.app_package.name
			}

			@app.save

			render turbo_stream: turbo_stream.replace(
				"inbox-sorts", 
				partial: "apps/inbox_packages/inbox_sorts", 
			)
			
		else
			
		end
	end


	protected

	def get_app_package
		@app.app_package_integrations
		.joins(:app_package)
		.find_by("app_packages.name": params[:id])
	end

end

