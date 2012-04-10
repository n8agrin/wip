rene.utils =
    translate: (x, y) -> ["translate(", String(x), ",", String(y), ")"].join("")
    attr: (name, retval) ->
        (v) =>
            return this[name] if not v?
            this[name] = v
            retval || this