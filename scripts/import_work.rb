#!/usr/bin/env ruby

require "cgi"
require "csv"
require "fileutils"
require "json"
require "net/http"
require "uri"

source_path = ARGV.fetch(0) do
  abort "Usage: ruby scripts/import_work.rb path/to/works.csv"
end

root = File.expand_path("..", __dir__)
content_dir = File.join(root, "src", "content", "work")
image_root = File.join(root, "public", "images", "work")

FileUtils.mkdir_p(content_dir)
FileUtils.mkdir_p(image_root)

order = {
  "streaming" => 1,
  "fintech" => 2,
  "retail" => 3,
  "private-equity" => 4,
  "action-sports" => 5,
  "auto-lending" => 6,
  "apparel" => 7,
}

services = {
  "streaming" => ["Product Design", "Design Systems", "Content"],
  "fintech" => ["Creative Direction", "Web Design", "Brand Systems"],
  "retail" => ["Creative Direction", "Campaigns", "Art Direction"],
  "private-equity" => ["Web Design", "Digital Strategy", "Development"],
  "action-sports" => ["Creative Direction", "Web Design", "Brand Systems"],
  "auto-lending" => ["Brand Systems", "Campaigns", "Environmental Design"],
  "apparel" => ["Creative Direction", "Campaigns", "Art Direction"],
}

copy_overrides = {
  ["retail", "Text Block 2"] => "Hot Topic's long-standing relationships across music became the backbone of several initiatives, including the Rude and Lovesick denim launches. Both campaigns remained part of the brand for years.",
  ["retail", "Text Block 4"] => "Photography brought many of these initiatives to life. Direction across each shoot established a cohesive visual language for music-led denim, pop-culture merchandise, and the evolving brand identity.",
  ["fintech", "Text Block 4"] => "CU Direct's annual conference created a stage for thought leadership, extending the visual system through a new theme and experience each year.",
}

def plain_text(value)
  return nil if value.nil? || value.strip.empty?

  text = value.gsub(%r{</p>\s*<p>}i, "\n\n")
              .gsub(%r{<br\s*/?>}i, "\n")
              .gsub(%r{<[^>]+>}, "")
  CGI.unescapeHTML(text).strip
end

def extension_for(url)
  extension = File.extname(URI.parse(url).path).downcase
  return extension if %w[.jpg .jpeg .png .webp .gif].include?(extension)

  ".webp"
end

def fetch(url, redirects = 5)
  raise "Too many redirects for #{url}" if redirects.zero?

  uri = URI.parse(url)
  response = Net::HTTP.get_response(uri)
  return response.body if response.is_a?(Net::HTTPSuccess)

  if response.is_a?(Net::HTTPRedirection)
    return fetch(URI.join(url, response.fetch("location")).to_s, redirects - 1)
  end

  raise "Download failed (#{response.code}) for #{url}"
end

def download(url, directory, basename)
  return nil if url.nil? || url.strip.empty?

  extension = extension_for(url)
  filename = "#{basename}#{extension}"
  destination = File.join(directory, filename)
  File.binwrite(destination, fetch(url)) unless File.exist?(destination)
  filename
end

rows = CSV.read(source_path, headers: true, liberal_parsing: true)

rows.each do |row|
  slug = row.fetch("Slug")
  project_images = File.join(image_root, slug)
  FileUtils.mkdir_p(project_images)

  image_number = 0
  gallery_number = 0

  image_path = lambda do |url, basename|
    filename = download(url, project_images, basename)
    filename ? "/images/work/#{slug}/#{filename}" : nil
  end

  thumbnail = image_path.call(row["Thumbnail"], "thumbnail")
  hero = image_path.call(row["Hero Image"], "hero")
  sections = []

  add_copy = lambda do |field|
    copy = copy_overrides.fetch([slug, field], plain_text(row[field]))
    sections << { "type" => "copy", "text" => copy } if copy && !copy.empty?
  end

  add_image = lambda do |field|
    next if row[field].nil? || row[field].strip.empty?

    image_number += 1
    src = image_path.call(row[field], format("image-%02d", image_number))
    sections << { "type" => "image", "src" => src, "alt" => "#{row.fetch('Name')} project image" }
  end

  add_gallery = lambda do |field|
    urls = (row[field] || "").split(";").map(&:strip).reject(&:empty?)
    next if urls.empty?

    gallery_number += 1
    images = urls.each_with_index.map do |url, index|
      filename = format("gallery-%02d-%02d", gallery_number, index + 1)
      {
        "src" => image_path.call(url, filename),
        "alt" => "#{row.fetch('Name')} project detail #{index + 1}",
      }
    end
    sections << { "type" => "gallery", "images" => images }
  end

  add_copy.call("Text Block 1")
  add_image.call("Image 1")
  add_gallery.call("Gallery 1")
  add_image.call("Image 2")
  add_image.call("Image 3")
  add_copy.call("Text Block 2")
  add_image.call("Image 4")
  add_image.call("Image 5")
  add_image.call("Image 6")
  add_copy.call("Text Block 3")
  add_image.call("Image 7")
  add_image.call("Image 8")
  add_image.call("Image 9")
  add_copy.call("Text Block 4")
  add_image.call("Image 10")
  add_gallery.call("Gallery 2")

  project = {
    "slug" => slug,
    "order" => order.fetch(slug),
    "name" => row.fetch("Name"),
    "year" => row.fetch("Year"),
    "title" => row.fetch("H1"),
    "summary" => row["Card description"] || row.fetch("H1"),
    "services" => services.fetch(slug),
    "thumbnail" => thumbnail,
    "hero" => hero,
    "intro" => plain_text(row["Project description"]),
    "sections" => sections,
  }

  File.write(
    File.join(content_dir, "#{slug}.json"),
    JSON.pretty_generate(project) + "\n",
  )
end

puts "Imported #{rows.length} projects."
