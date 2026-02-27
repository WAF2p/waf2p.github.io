#!/usr/bin/env ruby
# frozen_string_literal: true

# Build-time GitHub contributors cache.
#
# Why?
# - GitHub API rate limits and occasional latency make client-side fetching flaky.
# - We cache a small, public list of contributors during the Jekyll build and render it via Liquid.
#
# Outputs:
# - _data/github_contributors.json (for Liquid)
# - assets/data/github-contributors.json (optional runtime consumption)
#
# Optional env:
# - GITHUB_TOKEN: increases rate limits for GitHub API calls.

require "net/http"
require "uri"
require "json"
require "fileutils"
require "time"

module WAFPP
  class GitHubContributorsCache < Jekyll::Generator
    safe false
    priority :low

    def generate(site)
      meta = site.data["contributors_meta"] || {}
      repo = meta["repo"] || "waf2p/waf2p.github.io"
      per_page = 12
      api = "https://api.github.com/repos/#{repo}/contributors?per_page=#{per_page}"

      data_dir = File.join(site.source, "_data")
      FileUtils.mkdir_p(data_dir)
      data_path = File.join(data_dir, "github_contributors.json")
      etag_path = File.join(data_dir, "github_contributors.etag")

      public_dir = File.join(site.source, "assets", "data")
      FileUtils.mkdir_p(public_dir)
      public_path = File.join(public_dir, "github-contributors.json")

      etag = File.exist?(etag_path) ? File.read(etag_path).strip : nil

      uri = URI(api)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      req = Net::HTTP::Get.new(uri.request_uri)
      req["User-Agent"] = "wafpp-jekyll"
      req["Accept"] = "application/vnd.github+json"
      req["If-None-Match"] = etag if etag && !etag.empty?

      token = ENV["GITHUB_TOKEN"]
      req["Authorization"] = "Bearer #{token}" if token && !token.empty?

      begin
        res = http.request(req)

        if res.code.to_i == 304
          # Not modified – keep existing cache
          return
        end

        unless res.code.to_i.between?(200, 299)
          Jekyll.logger.warn("GitHubContributors", "API error #{res.code} – keeping existing cache (if any)")
          return
        end

        payload = JSON.parse(res.body)
        contributors = (payload || []).map do |c|
          {
            "login" => c["login"],
            "html_url" => c["html_url"],
            "avatar_url" => c["avatar_url"],
            "contributions" => c["contributions"]
          }
        end

        out = {
          "repo" => repo,
          "generated_at" => Time.now.utc.iso8601,
          "contributors" => contributors
        }

        json = JSON.pretty_generate(out)
        File.write(data_path, json)
        File.write(public_path, json)

        new_etag = res["etag"]
        File.write(etag_path, new_etag) if new_etag && !new_etag.empty?

        # Make data available in the same build run (without re-reading from disk)
        site.data["github_contributors"] = out
      rescue StandardError => e
        Jekyll.logger.warn("GitHubContributors", "Failed to fetch contributors: #{e.class}: #{e.message}")
      end
    end
  end
end
