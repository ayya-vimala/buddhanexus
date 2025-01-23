"""
Contains all database queries related to visual view.

"""

QUERY_VISUAL_COLLECTION_VIEW = """
LET category_list = (
  FOR file IN files
    FILTER file.lang == @lang
    SORT file.filenr ASC
    COLLECT collection = file.collection
    AGGREGATE categories = UNIQUE(file.category)
    RETURN {
      collection: collection,
      categories: categories
    }
  )

LET inquiry_collection = FIRST(
  FOR collection IN category_list
    FILTER collection.collection == @inquiry_collection
    RETURN collection.categories
  )

LET hit_collection = FIRST(RETURN (
  FOR collection IN @hit_collection
    FOR item in category_list
      LET selected_collection = (
        FILTER collection == item.collection
        RETURN item.categories
      )
      LET selected_category = (
        FILTER collection IN item.categories
        RETURN collection
      )
      RETURN APPEND(selected_collection[**], selected_category, true)
  )[**])

LET graphdata = (
  FOR inquiry_category IN inquiry_collection
    FOR stats IN global_stats_categories
      FILTER stats._key == inquiry_category
      LET inquiry_category_info = FIRST(
          FOR cat IN category_names
            FILTER cat.category == inquiry_category AND cat.lang == @lang
            RETURN CONCAT(cat.displayName, " (", cat.category, ")")
        )
      FOR hit_category in hit_collection
        FOR pair IN ENTRIES(stats.stats)
          FILTER pair[0] == hit_category
          LET hit_category_info = FIRST(
            FOR cat IN category_names
              FILTER cat.category == hit_category AND cat.lang == @lang
              RETURN CONCAT(cat.displayName, " (", cat.category, ")")
          )
          RETURN [inquiry_category_info, hit_category_info, pair[1]]
  )
RETURN {
      "totalpages": 1,
      "graphdata": graphdata
}
"""


QUERY_VISUAL_CATEGORY_VIEW = """
LET hit_category_list = (
  FOR file IN files
    FILTER file.lang == @lang
    FILTER file.collection IN @hit_collection OR file.category IN @hit_collection
    SORT file.filenr ASC
    COLLECT collection = file.collection
    AGGREGATE categories = UNIQUE(file.category)
    RETURN categories
  )[**]

LET totalpages = (
  FOR file IN files
    FILTER file.lang == @lang
    FILTER file.category == @inquiry_collection OR file._key == @inquiry_collection
    COLLECT WITH COUNT INTO total
    RETURN CEIL(total / 25)
)[0]

LET graphdata = (
  FOR file IN files
    FILTER file.lang == @lang
    FILTER file.category == @inquiry_collection OR file._key == @inquiry_collection
    SORT file.filenr ASC
    LIMIT 50 * @page,50
    FOR stats IN global_stats_files
      FILTER stats._key == file.filename
      FOR hit_category IN hit_category_list
        FOR pair IN ENTRIES(stats.stats)
          FILTER pair[0] == hit_category
          LET hit_category_info = FIRST(
            FOR cat IN category_names
              FILTER cat.category == hit_category AND cat.lang == @lang
              RETURN CONCAT(cat.displayName, " (", cat.category, ")")
          )
          RETURN [CONCAT(file.displayName, " (", file.textname, ")"), hit_category_info, pair[1]]
  )
RETURN {
      "totalpages": totalpages,
      "graphdata": graphdata
}
"""
