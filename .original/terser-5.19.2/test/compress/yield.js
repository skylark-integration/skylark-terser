generators: {
    input: {
        function* fn() {};
    }
    expect_exact: "function*fn(){}"
}

generators_yield: {
    input: {
      function* fn() {
        yield remote();
      }
    }
    expect_exact: "function*fn(){yield remote()}"
}

generators_yield_assign: {
    input: {
      function* fn() {
          var x = {};
          x.prop = yield 5;
      }
    }
    expect_exact: "function*fn(){var x={};x.prop=yield 5}"
}

generator_yield_undefined: {
    input: {
        function* fn() {
            yield;
        }
    }
    expect_exact: "function*fn(){yield}"
}

yield_await_comment: {
    options = {
        toplevel: true,
        reduce_vars: true,
        inline: true,
        evaluate: true,
        unused: true
    }
    input: {
        const apiWithComments = () =>
            /**! @preserve 1 */
            http.get("1");

        const apiWithComments2 = () =>
            /**! @preserve 2 */
            http.get("2");

        const apiWithComments3 = () =>
            /**! @preserve 3 */
            http.get("3");

        export function* test() {
            (yield apiWithComments()).data;
        }
        export async function test2() {
            (await apiWithComments2(await apiWithComments3())).data;
        }
    }
    expect_exact: [
        "export function*test(){(",
        "/**! @preserve 1 */",
        "yield http.get(\"1\")).data}export async function test2(){(",
        "/**! @preserve 3 */",
        "await(await http.get(\"3\"),",
        "/**! @preserve 2 */",
        "http.get(\"2\"))).data}",
    ]
}

yield_optimize_expression: {
    options = {
    }
    input: {
        function* f1() { yield; }
        function* f2() { yield undefined; }
        function* f3() { yield null; }
        function* f4() { yield* undefined; }
    }
    expect: {
        function* f1() { yield }
        function* f2() { yield; }
        function* f3() { yield null; }
        function* f4() { yield* void 0; }
    }
}

yield_statements: {
    input: {
        function* fn() {
            var a = (yield 1) + (yield 2);
            var b = (yield 3) === (yield 4);
            var c = (yield 5) << (yield 6);
            var d = yield 7;
            var e = (yield 8) ? yield 9 : yield 10;
            var f = -(yield 11);
        }
    }
    expect_exact: "function*fn(){var a=(yield 1)+(yield 2);var b=(yield 3)===(yield 4);var c=(yield 5)<<(yield 6);var d=yield 7;var e=(yield 8)?yield 9:yield 10;var f=-(yield 11)}"
}

yield_as_identifier_in_function_in_generator: {
    input: {
        var g = function*() {
            function h() {
                yield = 1;
            }
        };
    }
    expect: {
        var g = function*() {
            function h() {
                yield = 1;
            }
        };
    }
}

yield_before_punctuators: {
    input: {
        iter = (function*() {
            assignmentResult = [ x = yield ] = value;
        })();
        function* g1() { (yield) }
        function* g2() { [yield] }
        function* g3() { yield, yield; }
        function* g4() { (yield) ? yield : yield; }
    }
    expect: {
        iter = (function*() {
            assignmentResult = [ x = yield ] = value;
        })();
        function* g1() { (yield) }
        function* g2() { [yield] }
        function* g3() { yield, yield; }
        function* g4() { (yield) ? yield : yield; }
    }
}

yield_as_identifier_outside_strict_mode: {
    input: {
        import yield from "bar";
        yield = 123;
        while (true) {
            yield:
            for(;;) break yield;

            foo();
        }
        while (true)
            yield: for(;;) continue yield;
        function yield(){}
        function foo(...yield){}
        try { new Error("") } catch (yield) {}
        var yield = "foo";
    }
    expect: {
        import yield from "bar";
        yield = 123;
        while (true) {
            yield:
            for(;;) break yield;

            foo();
        }
        while (true)
            yield: for(;;) continue yield;
        function yield(){}
        function foo(...yield){}
        try { new Error("") } catch (yield) {}
        var yield = "foo";
    }
}

empty_generator_as_parameter_with_side_effects: {
    options = {
        side_effects: true
    }
    input: {
        var GeneratorPrototype = Object.getPrototypeOf(
          Object.getPrototypeOf(function*() {}())
        );
        evaluate(GeneratorPrototype);
    }
    expect_exact: "var GeneratorPrototype=Object.getPrototypeOf(Object.getPrototypeOf(function*(){}()));evaluate(GeneratorPrototype);"
}

empty_generator_as_parameter_without_side_effects: {
    options = {
        side_effects: false
    }
    input: {
        var GeneratorPrototype = Object.getPrototypeOf(
          Object.getPrototypeOf(function*() {}())
        );
        evaluate(GeneratorPrototype);
    }
    expect_exact: "var GeneratorPrototype=Object.getPrototypeOf(Object.getPrototypeOf(function*(){}()));evaluate(GeneratorPrototype);"
}

yield_dot: {
    options = {
    }
    input: {
        function* foo(){
            yield x.foo;
            (yield x).foo;
            yield (yield obj.foo()).bar();
        }
    }
    expect_exact: "function*foo(){yield x.foo;(yield x).foo;yield(yield obj.foo()).bar()}"
}

yield_sub: {
    options = {
    }
    input: {
        function* foo(){
            yield x['foo'];
            (yield x)['foo'];
            yield (yield obj.foo())['bar']();
        }
    }
    expect_exact: 'function*foo(){yield x["foo"];(yield x)["foo"];yield(yield obj.foo())["bar"]()}'
}

yield_as_ES5_property: {
    input: {
        "use strict";
        console.log({yield: 42}.yield);
    }
    expect_exact: '"use strict";console.log({yield:42}.yield);'
    expect_stdout: "42"
}

issue_2689: {
    options = {
        collapse_vars: true,
        unused: true,
    }
    input: {
        function* y() {
            var t = yield x();
            return new t();
        }
    }
    expect_exact: "function*y(){return new(yield x())}"
}

issue_2832: {
    beautify = {
        beautify: true,
    }
    input: {
        function* gen(i) {
            const result = yield (x = i, -x);
            var x;
            console.log(x);
            console.log(result);
            yield 2;
        }
        var x = gen(1);
        console.log(x.next("first").value);
        console.log(x.next("second").value);
    }
    expect_exact: [
        "function* gen(i) {",
        "    const result = yield (x = i, -x);",
        "    var x;",
        "    console.log(x);",
        "    console.log(result);",
        "    yield 2;",
        "}",
        "",
        "var x = gen(1);",
        "",
        'console.log(x.next("first").value);',
        "",
        'console.log(x.next("second").value);',
    ]
    expect_stdout: [
        "-1",
        "1",
        "second",
        "2",
    ]
}

issue_t60: {
    options = {
        collapse_vars: true,
        side_effects: true,
        unused: true,
    }
    input: {
        function* t() {
            const v = yield 1;
            yield 2;
            return v;
        }
        var g = t();
        console.log(g.next().value, g.next().value);
    }
    expect: {
        function* t() {
            const v = yield 1;
            yield 2;
            return v;
        }
        var g = t();
        console.log(g.next().value, g.next().value);
    }
    expect_stdout: "1 2"
}
