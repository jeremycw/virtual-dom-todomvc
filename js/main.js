(function(window, document) {
  var diff = require('virtual-dom/diff');
  var patch = require('virtual-dom/patch');
  var createElement = require('virtual-dom/create-element');
  var _ = require('underscore');
  var render = require('./view.js');

  document.addEventListener("DOMContentLoaded", function() {
    var eventQueue = [];

    document.body.addEventListener("click", function(e) { eventQueue.push(e); });
    document.body.addEventListener("dblclick", function(e) { eventQueue.push(e); });
    document.body.addEventListener("keydown", function(e) { eventQueue.push(e); });
    window.addEventListener("hashchange", function(e) { eventQueue.push(e); });

    var view = window.location.hash.split("#")[1] || "/";

    var stored = JSON.parse(localStorage.getItem('state'));
    if (stored) {
      var state = stored;
      state.view = view;
    } else {
      var state = { todos: [], input: "", currentId: 1, view: view };
    }

    //populate DOM
    var tree = render(state);
    var rootNode = createElement(tree);
    document.body.appendChild(rootNode);

    function update() {
      function findTodo(target) {
        var id = parseInt(ev.target.dataset.id);
        return _.find(state.todos, function(t) { return t.id === id });
      }

      function endEdit(todo) {
        if (todo !== null && todo !== undefined) {
          var text = todo.text.trim();
          if (text === "") {
            state.todos = _.reject(state.todos, function(t) { return t.id === todo.id });
          } else {
            todo.editing = false;
          }
        }
      }

      while (eventQueue.length > 0) {
        var ev = eventQueue.pop();
        switch (ev.type) {

          case "keydown":
            if (ev.target.id === "todo-input") {
              if (ev.key === "Enter") {
                var text = ev.target.value.trim();
                if (text.length > 0) {
                  state.todos.push({
                    text: text,
                    completed: false,
                    editing: false,
                    id: state.currentId
                  });
                  state.currentId++;
                  state.input = "";
                }
              } else {
                state.input = ev.target.value;
              }
            } else if (ev.target.className === "edit") {
              if (ev.key === "Enter") {
                var edit = _.find(state.todos, function(t) { return t.editing });
                endEdit(edit);
              } else {
                var todo = findTodo(ev.target);
                todo.text = ev.target.value;
              }
            }
            break;

          case "click":
            var id = parseInt(parseInt(ev.target.dataset.id));
            var edit = _.find(state.todos, function(t) { return t.editing });

            //cancel edit when you click anywhere except on the item you're editing
            if (edit
                && !(ev.target.className === "todo-label" && id === edit.id)
                && !(ev.target.className === "edit" && id === edit.id))
            {
              endEdit(edit);
            }

            if (ev.target.className === "destroy") {
              state.todos = _.reject(state.todos, function(t) { return t.id === id });
            } else if (ev.target.className === "toggle") {
              var todo = findTodo(ev.target);
              todo.completed = ev.target.checked;
            } else if (ev.target.className === "toggle-all") {
              var checked = ev.target.checked;
              _.each(state.todos, function(t) { t.completed = checked; });
            }
            break;

          case "dblclick":
            if (_.contains(ev.target.className.split(" "), "todo-label")) {
              var todo = findTodo(ev.target);
              todo.editing = true;
            }
            break;

          case "hashchange":
            var url = ev.newURL.split("#")[1];
            state.view = url;
            break;
        }
      }

      localStorage.setItem('state', JSON.stringify(state));

      var newTree = render(state);
      var patches = diff(tree, newTree);
      rootNode = patch(rootNode, patches);
      tree = newTree;
      requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  });
})(window, document);
