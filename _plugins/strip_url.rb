module Jekyll
  module StripUrl
    def clean_url(input)
      input.to_s.strip.gsub(/\n/, '')
    end
  end
end

Liquid::Template.register_filter(Jekyll::StripUrl)
