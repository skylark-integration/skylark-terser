issue_269_1: {
    options = {
        unsafe: true,
        unsafe_math: true,
    }
    input: {
        f(
            String(x),
            Number(x),
            Boolean(x),

            String(),
            Number(),
            Boolean()
        );
    }
    expect: {
        f(
            x + "", +x, !!x,
            "", 0, false
        );
    }
}

issue_269_dangers: {
    options = {
        unsafe: true,
    }
    input: {
        f(
            String(x, x),
            Number(x, x),
            Boolean(x, x)
        );
    }
    expect: {
        f(String(x, x), Number(x, x), Boolean(x, x));
    }
}

issue_269_in_scope: {
    options = {
        unsafe: true,
    }
    input: {
        var String, Number, Boolean;
        f(
            String(x),
            Number(x, x),
            Boolean(x)
        );
    }
    expect: {
        var String, Number, Boolean;
        f(String(x), Number(x, x), Boolean(x));
    }
}

strings_concat: {
    options = {
        unsafe: true,
    }
    input: {
        f(
            String(x + "str"),
            String("str" + x)
        );
    }
    expect: {
        f(
            x + "str",
            "str" + x
        );
    }
}

regexp: {
    options = {
        evaluate: true,
        unsafe: true,
    }
    input: {
        RegExp("foo");
        RegExp("bar", "ig");
        RegExp(foo);
        RegExp("bar", ig);
        RegExp("should", "fail");
    }
    expect: {
        /foo/;
        /bar/ig;
        RegExp(foo);
        RegExp("bar", ig);
        RegExp("should", "fail");
    }
}
