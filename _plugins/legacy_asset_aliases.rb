# Serve the pre-rebrand asset URLs from the renamed files.
#
# The source tree uses the WOMBATpass names. At build time we mirror
# the public ones back to their old "wafpass" paths so existing links,
# cached pages and social cards keep resolving. Only the generated
# _site is duplicated; the repository keeps one copy.
require "fileutils"

Jekyll::Hooks.register :site, :post_write do |site|
  aliases = {
    "assets/images/wafpass"              => "assets/images/wombatpass",
    "assets/images/wafpass_1.0"          => "assets/images/wombatpass_1.0",
    "assets/images/wafpass-report.png"   => "assets/images/wombatpass-report.png",
    "assets/js/wafpass-download.js"      => "assets/js/wombatpass-download.js",
    "assets/js/wafpass-scorecard.js"     => "assets/js/wombatpass-scorecard.js",
    "images/og/wafpass-action.jpg"       => "images/og/wombatpass-action.jpg",
    "images/og/wafpass-install.jpg"      => "images/og/wombatpass-install.jpg",
    "images/og/wafpass-scorecard.png"    => "images/og/wombatpass-scorecard.png",
    "images/og/wafpass-scorecard-de.png" => "images/og/wombatpass-scorecard-de.png"
  }

  aliases.each do |old_path, new_path|
    src = File.join(site.dest, new_path)
    dst = File.join(site.dest, old_path)
    next unless File.exist?(src)

    FileUtils.rm_rf(dst)
    FileUtils.mkdir_p(File.dirname(dst))
    FileUtils.cp_r(src, dst)
  end
end
