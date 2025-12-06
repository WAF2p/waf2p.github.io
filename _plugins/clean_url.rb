module Jekyll
  module CleanUrl
    def clean_url(input)
      input.to_s.gsub(/\s+/, '') # entfernt ALLE Whitespaces inkl. \n, \r, \t
    end
  end
end

Liquid::Template.register_filter(Jekyll::CleanUrl)
