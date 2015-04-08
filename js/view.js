(function() {
  var h = require('virtual-dom/h');
  var _ = require('underscore');
  // 1: Create a function that declares what the DOM should look like
  function render(state)  {
    function renderTodo(todo) {
      var classStr = todo.completed ? ".completed" : "";
      classStr += todo.editing ? ".editing" : "";
      var checkBox = { "type": "checkBox", dataset: { id: todo.id } };
      if (todo.completed) {
        checkBox.checked = true;
      }
      return h("li" + classStr, [
        h("div.view", [
          h("input.toggle", checkBox),
          h("label.todo-label", { dataset: { id: todo.id } }, [ todo.text ]),
          h("button.destroy", { dataset: { id: todo.id } })
        ]),
        h("input.edit", { "value": todo.text, dataset: { id: todo.id } })
      ])
    }

    var style = {};
    if (state.todos.length == 0) {
      style.display = "none";
    }
    var uncomplete = _.filter(state.todos, function(t) { return !t.completed });
    var plural = uncomplete.length !== 1 ? "items" : "item";

    var todos = state.todos;

    if (state.view === "/active") {
      todos = uncomplete;
    } else if (state.view === "/completed") {
      todos = _.filter(todos, function(t) { return t.completed });
    }
    var todoList = todos.map(renderTodo);
    var completed = state.view === "/completed" ? ".selected" : "";
    var active = state.view === "/active" ? ".selected" : "";
    var all = !active && !completed ? ".selected" : "";

    return h("div", [
      h("section.todoapp", [
        h("header.header", [
          h("h1", [ "todos" ]),
          h("input#todo-input.new-todo", { "placeholder": "What needs to be done?",
              "autofocus": "", "value": state.input })
        ]),
        /* This section should be hidden by default and shown when there are todos */
        h("section.main", [
          h("input.toggle-all", { "type": "checkbox", "style": style }),
          h("label", { "htmlFor": "toggle-all"}, [ "Mark all as complete" ]),
          h("ul.todo-list", todoList)
        ]),
        /* This footer should hidden by default and shown when there are todos */
        h("footer.footer", { style: style }, [
          /* This should be `0 items left` by default */
          h("span.todo-count", [ h("strong", [ String(uncomplete.length) ]), plural + " left" ]),
          /* Remove this if you don't implement routing */
          h("ul.filters", [
            h("li", [
              h("a" + all, { "href": "#/"}, [ "All" ])
            ]),
            h("li", [
              h("a" + active, { "href": "#/active"}, [ "Active" ])
            ]),
            h("li", [
              h("a" + completed, { "href": "#/completed"}, [ "Completed" ])
            ])
          ]),
          /* Hidden if no completed items are left ↓ */
          h("button.clear-completed", [ "Clear completed" ])
        ])
      ]),
      h("footer.info", [
        h("p", [ "Double-click to edit a todo" ]),
        /* Change this out with your name and url ↓ */
        h("p", [ "Created by", h("a", { "href": "http://todomvc.com"}, [ "you" ]) ]),
        h("p", [ "Part of", h("a", { "href": "http://todomvc.com"}, [ "TodoMVC" ]) ])
      ])
    ])
  }

  module.exports = render;
})();
