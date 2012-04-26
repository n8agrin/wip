rene.utils =
    translate: (x, y) -> ["translate(", String(x), ",", String(y), ")"].join("")

    naiveFill: (data) ->

        samples = data.map((dset) -> dset[0])

        if samples[0].x instanceof Date
            kind = "date"
        else
            kind = typeof samples[0].x

        data = data.map((dset) ->
            dset.map((p) ->
                n = {}
                for k, v of p
                    n[k] = v
                n))

        if kind is "date" or kind is "number"
            # First dedup the inner sets. This is an issue with weeks, for example.
            mapData = data.map((dset, i) ->
                dset.reduce(((p, c) ->
                    x = c.x.valueOf()
                    if not p[x]
                        p[x] = c
                    else
                        p[x].y += c.y
                    p), {}))

            points = d3.merge(mapData.map((dset) -> Object.keys(dset).map((x) -> parseInt(x, 10))))
                .sort((a,b) -> if a < b then -1 else if a is b then 0 else 1)
                .reduce(((p, c) ->
                    if p.last != c
                        p.push(c)
                        p.last = c
                    p), [])

            newSets = mapData.map((dset, i) ->
                points.map((p, j) -> dset[p] or {x: parseInt(p, 10), y: 0}))

            if kind is "date"
                newSets.forEach((dset) -> dset.forEach((p) -> p.x = new Date(p.x.valueOf())))
        else
            # categorical x fill
            # assumes order is first seen
            # reoders sets based on x name
            # [['red', 'green'], ['red', 'blue', 'green']]
            # becomes
            # [['red', 'green', 'blue'], ['red', 'green', 'blue']]
            seen = data.map((dset, di) ->
                dset.reduce(((p, c) ->
                    p[c.x] = c
                    p), {}))

            cats = d3.merge(seen.map((c) -> Object.keys(c))).sort().reduce(((p, c) ->
                if p.last != c
                    p.push(c)
                    p.last = c
                p), [])

            newSets = data.map((dset, di) -> cats.map((c) -> seen[di][c] or {x: c, y: 0}))

        newSets.forEach((dset, i) -> dset.forEach((p) ->
            for k, v of samples[i]
                if not p[k]?
                    p[k] = v))
        newSets