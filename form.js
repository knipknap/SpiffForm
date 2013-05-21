function attach_form(container) {
    var form = new SpiffForm(container);
    form.set_title('Feedback Form Demo');
    form.set_subtitle('Let us know what you think!');

    var choose = form.append(new SpiffFormDropdownList());
    choose.set_label('Complaint type');
    choose.add_option('');
    choose.add_option('Customer service');
    choose.select(1);

    var datepicker = form.append(new SpiffFormDatePicker());
    datepicker.set_label('Birth Date');

    form.append(new SpiffFormPartsField());

    var entry = form.append(new SpiffFormEntryField());
    entry.set_label('Complaint summary');
    entry.set_text('Stop sending me emails');

    var textbox = form.append(new SpiffFormTextArea());
    textbox.set_label('Irrelevant text');
    textbox.set_text('For the love of Jebus');

    var checkbox = form.append(new SpiffFormCheckbox());
    checkbox.set_label('Please send more spam to my inbox');
    return form;
}
