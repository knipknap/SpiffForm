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
// Utilities.
// ======================================================================
var SpiffFormTrackable = function() {
    this._listeners = {
    };

    this.trigger = function(event_name, extra_args) {
        if (!(this._listeners[event_name] instanceof Array))
            return true;
        var listeners = this._listeners[event_name];
        for (var i = 0, len = listeners.length; i < len; i++)
            if (listeners[i].apply(this, extra_args) === false)
                return false;
    };

    this.bind = function(event_name, listener) {
        if (this._listeners[event_name] instanceof Array)
            this._listeners[event_name].push(listener);
        else
            this._listeners[event_name] = [listener];
    };
};

var _SpiffFormObjectSerializer = function() {
    this.serialize_element = function(obj) {
        return {'handle': obj.get_handle(),
                'label': obj._label,
                'value': obj._value,
                'required': obj._required};
    };

    this.deserialize_element = function(obj, data) {
        obj._label = data.label;
        obj._value = data.value;
        obj._required = data.required;
        return obj;
    };

    this.serialize_entryfield = function(obj) {
        return this.serialize_element(obj);
    };

    this.deserialize_entryfield = function(data) {
        return this.deserialize_element(new SpiffFormEntryField(), data);
    };

    this.serialize_textarea = function(obj) {
        return this.serialize_element(obj);
    };

    this.deserialize_textarea = function(data) {
        return this.deserialize_element(new SpiffFormTextArea(), data);
    };

    this.serialize_button = function(obj) {
        return this.serialize_element(obj);
    };

    this.deserialize_button = function(data) {
        return this.deserialize_element(new SpiffFormButton(), data);
    };

    this.serialize_checkbox = function(obj) {
        return this.serialize_element(obj);
    };

    this.deserialize_checkbox = function(data) {
        return this.deserialize_element(new SpiffFormCheckbox(), data);
    };

    this.serialize_datepicker = function(obj) {
        return this.serialize_element(obj);
    };

    this.deserialize_datepicker = function(data) {
        var obj = this.deserialize_element(new SpiffFormDatePicker(), data);
        // Needs to be special cased because JSON.parse doesn't restore it
        // to the same type :-(.
        obj._value = new Date(data.value);
        return obj;
    };

    this.serialize_dropdownlist = function(obj) {
        var data = this.serialize_element(obj);
        data.items = obj._items.slice(0);
        return data;
    };

    this.deserialize_dropdownlist = function(data) {
        var obj = this.deserialize_element(new SpiffFormDropdownList(), data);
        for (var i = 0, len = data.items.length; i < len; i++)
            obj.add_option(data.items[i]);
        return obj;
    };

    this.serialize_form = function(form) {
        var that = this;
        var list = [];
        form._div.find('li.spiffform-canvas-item').each(function() {
            var obj = $(this).data('obj');
            list.push(obj.serialize(that));
        });
        return {'title': form.get_title(),
                'subtitle': form.get_subtitle(),
                'elements': list};
    };

    this.deserialize_form = function(form, data) {
        form.set_title(data.title);
        form.set_subtitle(data.subtitle);
        for (var i = 0, len = data.elements.length; i < len; i++) {
            var elem_data = data.elements[i];
            var method = 'deserialize_' + elem_data.handle;
            var obj = this[method](elem_data);
            form.append(obj);
        }
        return form;
    };
};

var _SpiffFormJSONSerializer = function() {
    this.serialize_form = function(form) {
        return JSON.stringify(Object.getPrototypeOf(this).serialize_form(form));
    };

    this.deserialize_form = function(form, data) {
        return Object.getPrototypeOf(this).deserialize_form(form, JSON.parse(data));
    };
};
_SpiffFormJSONSerializer.prototype = new _SpiffFormObjectSerializer();
var SpiffFormJSONSerializer = new _SpiffFormJSONSerializer();

// ======================================================================
// Form Editor Elements
// ======================================================================
var spiffform_elements = {};

var SpiffFormElement = function() {
    this._name = 'unnamed';
    this._div = undefined;
    this._label = 'Label';
    this._required = true;
    this._value = undefined;

    this.get_handle = function() {
        return Object.getPrototypeOf(this).handle;
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
            that.update();
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
            that.update();
        });
        return elem;
    };

    this.update = function() {
        throw new Error("SpiffFormElement object missing update().");
    };

    this.update_properties = function(elem) {
        throw new Error("SpiffFormElement object missing update_properties().");
    };

    this.set_label = function(label) {
        this._label = label;
        return this.trigger('changed');
    };

    this.required = function(required) {
        this._required = required;
        return this.trigger('changed');
    };

    this.serialize = function(serializer) {
        return serializer.serialize_element(this);
    };

    this.deserialize = function(serializer, data) {
        return serializer.deserialize_element(this, data);
    };
};

SpiffFormElement.prototype = new SpiffFormTrackable();

// -----------------------
// Entry Box
// -----------------------
var SpiffFormEntryField = function() {
    this._name = 'Entry Field';
    var that = this;

    this.attach = function(div) {
        this._div = div;
        this.update();
    };

    this.update = function() {
        if (!that._div)
            return;
        that._div.empty();
        that._div.append('<label>' + that._get_label_html() + '<input type="text"/></label>');
        that._div.find('input:text').val(that._value);
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
            that.update();
        });

        // Required checkbox.
        elem.append(this._get_required_checkbox());
    };

    this.set_text = function(text) {
        this._value = text;
        this.update();
    };

    this.serialize = function(serializer) {
        return serializer.serialize_entryfield(this);
    };

    this.deserialize = function(serializer, data) {
        return serializer.deserialize_entryfield(this, data);
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
    var that = this;

    this.attach = function(div) {
        this._div = div;
        this.update();
    };

    this.update = function() {
        if (!that._div)
            return;
        that._div.empty();
        that._div.append('<label>'+ that._get_label_html() + '<textarea></textarea></label>');
        that._div.find('textarea').text(that._value);
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
            that.update();
        });

        // Required checkbox.
        elem.append(this._get_required_checkbox());
    };

    this.set_text = function(text) {
        this._value = text;
        this.update();
    };

    this.serialize = function(serializer) {
        return serializer.serialize_textarea(this);
    };

    this.deserialize = function(serializer, data) {
        return serializer.deserialize_textarea(this, data);
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
    var that = this;

    this.attach = function(div) {
        this._div = div;
        this.update();
    };

    this.update = function() {
        if (!that._div)
            return;
        that._div.empty();
        that._div.append('<input type="button" value="Label"/>');
    };

    this.update_properties = function(elem) {
        elem.append('Button properties');
    };

    this.serialize = function(serializer) {
        return serializer.serialize_button(this);
    };

    this.deserialize = function(serializer, data) {
        return serializer.deserialize_button(this, data);
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
    var that = this;

    this.attach = function(div) {
        this._div = div;
        this.update();
    };

    this.update = function() {
        if (!that._div)
            return;
        that._div.empty();
        that._div.append('<label><input type="checkbox"/>' + that._get_label_html(false) + '</label>');
        that._div.find('input').prop('checked', that._value);
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
            that.update();
        });

        // Required checkbox.
        elem.append(this._get_required_checkbox());
    };

    this.select = function(selected) {
        this._value = selected || typeof selected === 'undefined';
        this.update();
    };

    this.serialize = function(serializer) {
        return serializer.serialize_checkbox(this);
    };

    this.deserialize = function(serializer, data) {
        return serializer.deserialize_checkbox(this, data);
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
    var that = this;

    this.attach = function(div) {
        this._div = div;
        this.update();
    };

    this.update = function() {
        if (!that._div)
            return;
        that._div.empty();
        that._div.append('<label>'+ that._get_label_html() + '<input type="text"/></label>');
        var input = that._div.find('input').datepicker();
        input.datepicker('setDate', that._value);
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
                that.update();
            }
        });
        input.datepicker('setDate', this._value);

        // Required checkbox.
        elem.append(this._get_required_checkbox());
    };

    this.serialize = function(serializer) {
        return serializer.serialize_datepicker(this);
    };

    this.deserialize = function(serializer, data) {
        return serializer.deserialize_datepicker(this, data);
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
    this._items = [];
    var that = this;

    this.attach = function(div) {
        this._div = div;
        this.update();
    };

    this._get_select_elem = function() {
        var select = $('<select></select>');
        for (var i = 0, len = this._items.length; i < len; i++)
            select.append('<option value="' + i + '">' + this._items[i] + '</option>');
        select.val(this._value);
        return select;
    };

    this.update = function() {
        if (!that._div)
            return;
        that._div.empty();
        that._div.append('<label>'+ that._get_label_html() + '</label>');
        that._div.find('label').append(that._get_select_elem());
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
            that.update();
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
                that.update();
            }

            // If the last entry box was cleared, remove the entry
            // from our internal array, but leave the entry box available.
            if ($(this).val() === '') {
                if (index < that._items.length)
                    that._items.splice(index, 1);
                that.update();
            }

            // If the last entry box was filled, update our internal
            // array, and add another entry box.
            if (index < that._items.length)
                that._items[index] = $(this).val();
            if (index >= that._items.length)
                that._items.push($(this).val());
            that.update();
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
        this.update();
    };

    this.select = function(option) {
        this._value = option;
        this.update();
    };

    this.serialize = function(serializer) {
        return serializer.serialize_dropdownlist(this);
    };

    this.deserialize = function(serializer, data) {
        return serializer.deserialize_dropdownlist(this, data);
    };
};

SpiffFormDropdownList.prototype = new SpiffFormElement();
SpiffFormDropdownList.prototype.handle = 'dropdownlist';
spiffform_elements[SpiffFormDropdownList.prototype.handle] = SpiffFormDropdownList;

// ======================================================================
// Form
// ======================================================================
var SpiffForm = function(div) {
    this._div = div;
    this._panel = undefined;
    var that = this;

    if (this._div.length != 1)
        throw new Error('form selector needs to match exactly one element');

    // Returns True if the given (mouse pointer) position is within the given
    // distance of the editor.
    this.hits_form = function(x, y, distance) {
        if (typeof distance === 'undefined')
            distance = 0;
        return x > that._div.offset().left - distance &&
               x < that._div.offset().left + that._div.width() + distance &&
               y > that._div.offset().top - distance &&
               y < that._div.offset().top + that._div.height() + distance;
    };

    // Returns the name/title of the form.
    this.get_title = function() {
        return this._div.find('.spiffform-title').text();
    };

    // Change the name/title of the form.
    this.set_title = function(name) {
        this._div.find('.spiffform-title').text(name);
    };

    // Returns the subtitle of the form.
    this.get_subtitle = function() {
        return this._div.find('.spiffform-subtitle').val();
    };

    // Change the subtitle of the form.
    this.set_subtitle = function(subtitle) {
        this._div.find('.spiffform-subtitle').val(subtitle);
    };

    // Change the hint shown underneath of the form. Accepts either a dom
    // element, plain text, or the following keywords:
    //   drag, delete
    this.set_hint = function(hint) {
        var elem = this._div.find('.spiffform-canvas-hint');
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
        else if (hint === '') {
            elem.hide();
            return;
        }
        else if (typeof hint === 'object') {
            elem.empty();
            elem.append(hint);
        }
        else {
            elem.text(hint);
        }
        elem.show();
    };

    // Show buttons below the form. Accepts a dom element, or the following
    // keywords: submit.
    // Returns the inserted dom element.
    this.set_buttons = function(buttons) {
        var elem = this._div.find('.spiffform-buttons');
        if (buttons == 'submit')
            buttons = $('<input type="submit"/>');
        elem.empty();
        elem.append(buttons);
        return buttons;
    };

    // Unselect all items.
    this.unselect = function() {
        that._div.find('*').removeClass('spiffform-canvas-item-selected');
    };

    // Select the given item. Expects an SpiffFormElement.
    this.select = function(obj) {
        that.unselect();
        obj._div.parent().addClass('spiffform-canvas-item-selected');
    };

    this._attach = function(obj) {
        var handle = obj.get_handle();
        var elem = $('<li class="spiffform-canvas-item">' +
                     '<div class="spiffform-ui-element spiffform-ui-' + handle + '">' +
                     '</div>' +
                     '</li>');
        elem.data('obj', obj);
        elem.click(function(e) { return that.trigger('clicked', [e, obj]); });
        var div = elem.find('div');
        obj.attach(div);
        return elem;
    };

    // Inserts a new element at the end of the form.
    this.append = function(obj) {
        if (typeof obj === 'undefined')
            throw new Error('object is required argument');
        var elem = this._attach(obj);
        this._div.find('.spiffform-canvas-elements').append(elem);
        return obj;
    };

    // Removes the given element from the form. Expects a SpiffFormElement.
    this.remove = function(obj) {
        obj._div.parent().remove();
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
        var elem = this._attach(obj);
        if (!target.is('li'))
            target = target.parents('li').first();
        if (target.is('li.spiffform-canvas-item'))
            elem.insertBefore(target);
        else if (target.is('li')) {
            // Dropped on the form header.
            elem.insertAfter(this._div.find('li:not(.spiffform-canvas-item):last'));
        }
        else {
            // Dropped on the form, but not on the element list.
            this._div.find('.spiffform-canvas-elements').append(elem);
        }
    };

    this.make_editable = function(panel) {
        // Attach the panel.
        if (typeof panel === 'undefined')
            throw new Error('panel argument is required');
        if (typeof this._panel !== 'undefined')
            throw new Error('form is already attached to another panel');
        this._panel = panel;
        this._panel.hide();

        // Some visual changes.
        this.set_hint('drag');
        this.set_buttons($(''));
        this._div.addClass('spiffform-editor');
        this._div.find('input.spiffform-subtitle').removeAttr("disabled");

        // Initialize click events on the dom.
        that._div.click(function() {
            that.unselect();
            that._panel.hide();
        });
        that.bind('clicked', function(e, obj) {
            that.select(obj);
            that._panel.show_properties(obj, obj._div);
            return false;
        });

        // Make form sortable.
        that._div.find('.spiffform-canvas-elements').sortable({
            cancel: ':input:not([type=button])',
            items: 'li.spiffform-canvas-item',
            placeholder: 'spiffform-canvas-placeholder',
            distance: 3,
            axis: 'y',
            containment: this._div,
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
                //ui.placeholder.height(Math.min(30, ui.helper.outerHeight()));
                that.set_hint('delete');
            },
            beforeStop: function(e, ui) {
                that.set_hint('drag');
                if (!ui.placeholder.is(':visible'))
                    that.remove(ui.item.data('obj'));
            }
        });
    };

    this.serialize = function(serializer) {
        return serializer.serialize_form(this);
    };

    this.deserialize = function(serializer, data) {
        this._div.find('li.spiffform-canvas-item').each(function() {
            var obj = $(this).data('obj');
            that.remove(obj);
        });
        return serializer.deserialize_form(this, data);
    };

    // Create the dom for the form.
    this._div.append('<div class="spiffform-canvas">' +
                     '<ul class="spiffform-canvas-elements">' +
                     '<li><h2 class="spiffform-title"></h2></li>' +
                     '<li><input type="text" class="spiffform-subtitle" name="subtitle" value=""/></li>' +
                     '<li><hr/></li>' +
                     '</ul>' +
                     '<div class="spiffform-canvas-hint"><span></span></div>' +
                     '<div class="spiffform-buttons"></div>' +
                     '</div>');

    this._div.find('input.spiffform-subtitle').attr("disabled", "disabled");
    this.set_title('Untitled');
    this.set_subtitle('Please fill out the form.');
    this.set_hint('');
    this.set_buttons('submit');
};

SpiffForm.prototype = new SpiffFormTrackable();

// ======================================================================
// Form Editor Panel (for showing properties, etc.)
// ======================================================================
var SpiffFormPanel = function(panel_div) {
    this._panel = panel_div;

    if (this._panel.length != 1)
        throw new Error('panel selector needs to match exactly one element');

    // Hide the panel.
    this.hide = function(speed) {
        this._panel.slideUp(speed);
    };

    // Show properties for the given item. Expects an li element.
    this.show_properties = function(obj, elem) {
        this._panel.empty();
        this._panel.append('<h3>' + obj._name + ' Properties</h3>' +
                           '<div class="spiffform-panel-content"></div>');
        obj.update_properties(this._panel.find('div'));
        this._panel.slideDown("slow");
    };
};
