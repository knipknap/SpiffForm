/*
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
// ======================================================================
// Form Editor Elements
// ======================================================================
var spiffform_elements = {};

var SpiffFormElement = function() {
    this._name = 'unnamed';
    this._label = 'Label';
    this._required = true;
    this._value = undefined;
    this._listeners = {
        'changed': []
    };

    this.trigger = function(event_name) {
        if (!this._listeners[event_name] instanceof Array)
            return true;
        var listeners = this._listeners[event_name];
        for (var i = 0, len = listeners.length; i < len; i++)
            listeners[i].call(this);
    };

    this.bind = function(event_name, listener) {
        if (!this._listeners[event_name] instanceof Array)
            this._listeners[event_name] = [listener];
        else
            this._listeners[event_name].push(listener);
    };

    this._get_required_mark_html = function() {
        if (this._required)
            return '<span class="spiffform-required">*</span>';
        return '';
    };

    this._get_label_html = function(with_colon) {
        if (with_colon || typeof with_colon === 'undefined')
            return this._label + ':' + this._get_required_mark_html();
        else
            return this._label + ' ' + this._get_required_mark_html();
    };

    // Returns DOM for an entry box for editing the element's label.
    this._get_label_entry = function() {
        var that = this;
        var elem = $('<div><label>Label: <input type="text"/></label></div>');
        var input = elem.find('input');
        input.val(this._label);
        input.bind('keyup mouseup change', function() {
            that._label = $(this).val();
            that.trigger('changed');
        });
        return elem;
    };

    // Returns DOM for a checkbox for changing the "required" setting.
    this._get_required_checkbox = function() {
        var that = this;
        var elem = $('<div>' +
                     '<label><input type="checkbox"/> Required field</label>' +
                     '</div>');
        elem.find('input').prop('checked', this._required);
        elem.find('input').click(function(e) {
            that._required = $(this).is(':checked');
            that.trigger('changed');
        });
        return elem;
    };

    this.update_html = function() {
        throw new Error("SpiffFormElement object missing update_html().");
    };

    this.update_properties = function(elem) {
        throw new Error("SpiffFormElement object missing update_properties().");
    };

    this.set_label = function(label) {
        this._label = label;
        this.trigger('changed');
    };

    this.required = function(required) {
        this._required = required;
        this.trigger('changed');
    };
};

// -----------------------
// Entry Box
// -----------------------
var SpiffFormEntryField = function() {
    this._name = 'Entry Field';

    this.update_html = function(elem) {
        elem.append('<label>' + this._get_label_html() + '<input type="text"/></label>');
        elem.find('input').val(this._value);
    };

    this.update_properties = function(elem) {
        // Label text.
        elem.append(this._get_label_entry());

        // Default value.
        var that = this;
        elem.append('<div><label>Default: <input type="text" name="default"/></label></div>');
        var input = elem.find('input[name=default]');
        input.val(this._value);
        input.bind('keyup mouseup change', function() {
            that._value = $(this).val();
            that.trigger('changed');
        });

        // Required checkbox.
        elem.append(this._get_required_checkbox());
    };

    this.set_text = function(text) {
        this._value = text;
        this.trigger('changed');
    };
};

SpiffFormEntryField.prototype = new SpiffFormElement();
SpiffFormEntryField.prototype.handle = 'entryfield';
spiffform_elements[SpiffFormEntryField.prototype.handle] = SpiffFormEntryField;

// -----------------------
// Text Box
// -----------------------
var SpiffFormTextArea = function() {
    this._name = 'Text Area';
    this._value = '';

    this.update_html = function(elem) {
        elem.append('<label>'+ this._get_label_html() + '<textarea></textarea></label>');
        elem.find('textarea').text(this._value);
    };

    this.update_properties = function(elem) {
        // Label text.
        elem.append(this._get_label_entry());

        // Default value.
        var that = this;
        elem.append('<div><label>Default: <textarea></texarea></label></div>');
        var textarea = elem.find('textarea');
        textarea.val(this._value);
        textarea.bind('keyup mouseup change', function() {
            that._value = $(this).val();
            that.trigger('changed');
        });

        // Required checkbox.
        elem.append(this._get_required_checkbox());
    };

    this.set_text = function(text) {
        this._value = text;
        this.trigger('changed');
    };
};

SpiffFormTextArea.prototype = new SpiffFormElement();
SpiffFormTextArea.prototype.handle = 'textarea';
spiffform_elements[SpiffFormTextArea.prototype.handle] = SpiffFormTextArea;

// -----------------------
// Button
// -----------------------
var SpiffFormButton = function() {
    this._name = 'Button';

    this.update_html = function(elem) {
        elem.append('<input type="button" value="Label"/>');
    };

    this.update_properties = function(elem) {
        elem.append('Button properties');
    };
};

SpiffFormButton.prototype = new SpiffFormElement();
SpiffFormButton.prototype.handle = 'button';
spiffform_elements[SpiffFormButton.prototype.handle] = SpiffFormButton;

// -----------------------
// Checkbox
// -----------------------
var SpiffFormCheckbox = function() {
    this._label = 'Please send more spam to my inbox';
    this._name = 'Checkbox';
    this._value = false;

    this.update_html = function(elem) {
        elem.append('<label><input type="checkbox"/>' + this._get_label_html(false) + '</label>');
        elem.find('input').prop('checked', this._value);
    };

    this.update_properties = function(elem) {
        // Label text.
        elem.append(this._get_label_entry());

        // Default value.
        var that = this;
        elem.append('<div><label>Default: <input type="checkbox" name="checkbox"></label></div>');
        var checkbox = elem.find('input[name=checkbox]');
        checkbox.prop('checked', this._value);
        checkbox.click(function() {
            that._value = $(this).prop('checked');
            that.trigger('changed');
        });

        // Required checkbox.
        elem.append(this._get_required_checkbox());
    };

    this.select = function(selected) {
        this._value = selected || typeof selected === 'undefined';
        this.trigger('changed');
    };
};

SpiffFormCheckbox.prototype = new SpiffFormElement();
SpiffFormCheckbox.prototype.handle = 'checkbox';
spiffform_elements[SpiffFormCheckbox.prototype.handle] = SpiffFormCheckbox;

// -----------------------
// Date Picker
// -----------------------
var SpiffFormDatePicker = function() {
    this.handle = 'calendar';
    this._name = 'Date Picker';
    this._label = 'Date';

    this.update_html = function(elem) {
        elem.append('<label>'+ this._get_label_html() + '<input type="text"/></label>');
        var input = elem.find('input').datepicker();
        input.datepicker('setDate', this._value);
    };

    this.update_properties = function(elem) {
        // Label text.
        elem.append(this._get_label_entry());

        // Default value.
        var that = this;
        elem.append('<div><label>Default: <input type="text" name="default"/></label></div>');
        var input = elem.find('input[name=default]');
        input.datepicker({
            'onSelect': function() {
                that._value = $(this).datepicker('getDate');
                that.trigger('changed');
            }
        });
        input.datepicker('setDate', this._value);

        // Required checkbox.
        elem.append(this._get_required_checkbox());
    };
};

SpiffFormDatePicker.prototype = new SpiffFormElement();
SpiffFormDatePicker.prototype.handle = 'datepicker';
spiffform_elements[SpiffFormDatePicker.prototype.handle] = SpiffFormDatePicker;

// -----------------------
// Dropdown List
// -----------------------
var SpiffFormDropdownList = function() {
    this._name = 'Dropdown List';
    this._label = 'Please choose';
    this._value = undefined;
    this._items = [];

    this._get_select_elem = function() {
        var select = $('<select></select>');
        for (var i = 0, len = this._items.length; i < len; i++)
            select.append('<option value="' + i + '">' + this._items[i] + '</option>');
        select.val(this._value);
        return select;
    };

    this.update_html = function(elem) {
        elem.append('<label>'+ this._get_label_html() + '</label>');
        elem.find('label').append(this._get_select_elem());
    };

    this.update_properties = function(elem) {
        // Label text.
        elem.append(this._get_label_entry());

        // List of options.
        var that = this;
        elem.append('<div><label>Options:</label><ul></ul></div>');
        var ul = elem.find('ul');

        // Click handler for the delete buttons in the option list.
        function delete_button_clicked() {
            var index = $(this).parent().index();
            if (index < that._items.length)
                that._items.splice(index, 1);
            $(this).parent().remove();
            that.trigger('changed');
        }

        // Handler for 'changed' events from the option list.
        function entry_changed() {
            var li = $(this).parent();
            var index = li.index();
            var is_last = li.is(':last');

            // If all entry boxes are now filled, add another.
            var empty = ul.find('input:text[value=""]');
            if (empty.length === 0)
                append_entry('');

            // Was an existing entry changed, or was the last, empty box
            // changed? (The last entry box may not have a corresponding entry
            // in our array yet.)
            if (!is_last) {
                that._items[index] = $(this).val();
                that.trigger('changed');
                return;
            }

            // If the last entry box was cleared, remove the entry
            // from our internal array, but leave the entry box available.
            if ($(this).val() === '') {
                if (index < that._items.length)
                    that._items.splice(index, 1);
                that.trigger('changed');
                return;
            }

            // If the last entry box was filled, update our internal
            // array, and add another entry box.
            if (index < that._items.length)
                that._items[index] = $(this).val();
            if (index >= that._items.length)
                that._items.push($(this).val());
            that.trigger('changed');
        }

        // Appends one li to the option list.
        function append_entry(value) {
            ul.append('<li>' +
                      '<input type="text"/><input type="button" value="-"/>' +
                      '</li>');
            var li = ul.find('li:last');
            var input = li.find('input[type=text]');
            input.val(value);
            input.bind('keyup mouseup change', entry_changed);
            li.find('input[type=button]').click(delete_button_clicked);
        }

        // Create the entries in the option list.
        for (var i = 0, len = this._items.length; i < len || i < 2; i++)
            append_entry(this._items[i]);
        var empty = ul.find('input:text[value=""]');
        if (empty.length === 0)
            append_entry('');

        // Initial value.
        elem.append('<div><label>Default:</label></div>');
        var select = this._get_select_elem();
        elem.children('div:last').append(select);
        select.change(function() {
            that.select($(this).val());
        });

        // Required checkbox.
        elem.append(this._get_required_checkbox());
    };

    this.add_option = function(option) {
        this._items.push(option);
        this.trigger('changed');
    };

    this.select = function(option) {
        this._value = option;
        this.trigger('changed');
    };
};

SpiffFormDropdownList.prototype = new SpiffFormElement();
SpiffFormDropdownList.prototype.handle = 'dropdownlist';
spiffform_elements[SpiffFormDropdownList.prototype.handle] = SpiffFormDropdownList;

// ======================================================================
// Form Editor
// ======================================================================
var SpiffFormEditor = function(form_div, panel) {
    this._form = form_div;
    this._panel = panel;
    var that = this;

    if (this._form.length != 1)
        throw new Error('form selector needs to match exactly one element');
    this._panel.hide();

    // Returns True if the given (mouse pointer) position is within the given
    // distance around the given element.
    this._in_element = function(elem, x, y, distance) {
        if (typeof distance === 'undefined')
            distance = 0;
        return x > elem.offset().left - distance &&
               x < elem.offset().left + elem.width() + distance &&
               y > elem.offset().top - distance &&
               y < elem.offset().top + elem.height() + distance;
    };

    // Change the name/title of the form.
    this.set_name = function(name) {
        this._form.find('.spiffform-title').text(name);
    };

    // Change the subtitle of the form.
    this.set_subtitle = function(subtitle) {
        this._form.find('.spiffform-subtitle').val(subtitle);
    };

    // Change the hint shown underneath of the form.
    this.set_hint = function(hint) {
        var elem = this._form.find('.spiffform-canvas-hint');
        var span = elem.find('span');
        elem.removeClass('spiffform-canvas-hint-arrow-right');
        elem.removeClass('spiffform-canvas-hint-delete');
        if (hint == 'drag') {
            span.text('Drag form elements from the right');
            elem.addClass('spiffform-canvas-hint-arrow-right');
        }
        else if (hint == 'delete') {
            span.text('Drop here to remove');
            elem.addClass('spiffform-canvas-hint-delete');
        }
        else {
            span.text(hint);
        }
    };

    // Unselect all items.
    this.unselect = function(hide_panel) {
        this._form.find('*').removeClass('spiffform-canvas-item-selected');
        if (hide_panel || typeof hide_panel === 'undefined')
            this._panel.hide('slow');
    };

    // Select the given item. Expects an li element.
    this.select = function(elem) {
        this.unselect(false);
        elem.addClass('spiffform-canvas-item-selected');
        this._panel.show_properties(elem.data('obj'), elem);
    };

    // Expects click events from li nodes.
    this._element_clicked = function(event) {
        that.select($(this));
        return false;
    };

    this._html_for_element = function(obj) {
        var handle = Object.getPrototypeOf(obj).handle;
        var elem = $('<li class="spiffform-canvas-item">' +
                     '<div class="spiffform-ui-element spiffform-ui-' + handle + '">' +
                     '</div>' +
                     '</li>');
        elem.data('obj', obj);
        elem.click(this._element_clicked);
        var div = elem.find('div');
        obj.update_html(div);
        obj.bind('changed', function() {
            div.empty();
            obj.update_html(div);
        });
        return elem;
    };

    // Inserts a new element at the end of the form.
    this.append = function(obj) {
        if (typeof obj === 'undefined')
            throw new Error('object is required argument');
        var elem = this._html_for_element(obj);
        this._form.find('.spiffform-canvas-elements').append(elem);
        return obj;
    };

    // Removes the given element from the form. Expects an li element.
    this.remove = function(elem) {
        elem.remove();
        this.unselect();
    };

    // Inserts a new element at the position that is specified within the given
    // event.
    this.insert_at = function(event, obj) {
        if (typeof obj === 'undefined')
            throw new Error('object is required argument');

        // Make sure that the element was dropped within this form.
        var target = $(event.toElement);
        if (!target.parents().andSelf().filter('div.spiffform').length)
            return;

        // Insert at the appropriate position, or append if this is the first item.
        var elem = this._html_for_element(obj);
        if (!target.is('li'))
            target = target.parents('li').first();
        if (target.is('li.spiffform-canvas-item'))
            elem.insertBefore(target);
        else if (target.is('li')) {
            // Dropped on the form header.
            elem.insertAfter(this._form.find('li:not(.spiffform-canvas-item):last'));
        }
        else {
            // Dropped on the form, but not on the element list.
            this._form.find('.spiffform-canvas-elements').append(elem);
        }
    };

    // Create the dom for the form.
    this._form.append('<div class="spiffform-canvas">' +
                    '<ul class="spiffform-canvas-elements">' +
                    '<li><h2 class="spiffform-title"></h2></li>' +
                    '<li><input type="text" class="spiffform-subtitle" name="subtitle" value=""/></li>' +
                    '<li><hr/></li>' +
                    '</ul>' +
                    '<div class="spiffform-canvas-hint"><span></span></div>' +
                    '</div>');
    this._form.click(function() { that.unselect($(this)); });
    this.set_name('Untitled');
    this.set_subtitle('Please fill out the form.');
    this.set_hint('drag');

    // Callback function that returns true if the given event happened within
    // the form, returns false otherwise.
    function in_form(e, ui) {
        var form = $(e.toElement).parents('.spiffform').first();
        return that._in_element(form, e.pageX, e.pageY, 40);
    }

    // Initialize the events on the dom.
    this._form.find('.spiffform-canvas-elements').sortable({
        cancel: ':input:not([type=button])',
        items: 'li.spiffform-canvas-item',
        placeholder: 'spiffform-canvas-placeholder',
        distance: 3,
        axis: 'y',
        containment: this._form,
        forcePlaceholderSize: true,
        receive: function(e, ui) {
            ui.placeholder.toggle(true);
        },
        over: function(e, ui) {
            ui.placeholder.toggle(true);
        },
        out: function(e, ui) {
            ui.placeholder.toggle(false);
        },
        start: function(e, ui) {
            that.set_hint('delete');
        },
        beforeStop: function(e, ui) {
            that.set_hint('drag');
            if (!ui.placeholder.is(':visible'))
                that.remove(ui.item);
        }
    });
};

// ======================================================================
// Form Editor Panel (for showing properties, etc.)
// ======================================================================
var SpiffFormPanel = function(panel_div) {
    this._panel = panel_div;

    if (this._panel.length != 1)
        throw new Error('panel selector needs to match exactly one element');

    // Hide the panel.
    this.hide = function(speed) {
        this._panel.hide(speed);
    };

    // Show properties for the given item. Expects an li element.
    this.show_properties = function(obj, elem) {
        this._panel.empty();
        this._panel.append('<h3>' + obj._name + ' Properties</h3>' +
                           '<div class="spiffform-panel-content"></div>');
        obj.update_properties(this._panel.find('div'));
        this._panel.show('fast');
    };
};
