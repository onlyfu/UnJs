/**
 * Form Designer
 */
Controller.extend('form_designer', function () {
    var self = this;
    // 事件监听
    this.bind = {
        // 左侧组件菜单开关
        '.form-designer-component-selector h2 click.designer_component_': '_openComponentSelector',
        // 拖拽组件到指定区域
        '.form-designer-component-selector li mousedown.drag_': '_drag',
        // 组件设置，文本框值变化
        '.form-designer-component-setting input.js-property-input input.setting_change_': '_settingEvent.inputChange',
        // 组件设置，选择框值变化
        '.form-designer-component-setting .js-property-select change.setting_select_change_': '_settingEvent.selectChange',
        '.form-designer-component-setting input[type=radio] click.setting_radio_click_': '_settingEvent.radioClick',
        '.form-designer-component-setting .js-form-designer-component-datepicker change.setting_change_': '_settingEvent.datepickerChange',
        // 组件设置，删除组件
        '.form-designer-component-setting .js-form-designer-component-del click.component_del_': '_settingEvent.delComponent',
        //
        '#js-form-designer-verify-test click': '_settingEvent.verifyTest',
        //
        '.form-designer-form #js-verify-form mouseenter.form_mouseenter_': '_settingEvent.formMouseEnter',
        '.form-designer-form #js-verify-form mouseleave.form_mouseleave_': '_settingEvent.formMouseLeave',
        '.form-designer-layout-container .form-designer-component-container click.component_container_click_': '_settingEvent.editComponent'
    };

    this.index = function() {
        // 组件菜单
        this.watch(this.model.get(), 'openComponentId', '_renderComponentSelector');
        // 属性
        this.watch(this.model.get(), 'openProperty', '_renderProperty');
        //this.watch(this.model.get(), 'openProperty', '_renderLayout');
        // 空Element
        this.watch(this.model.get(), 'openEmptyProperty', '_renderEmptyProperty');
        // 布局
        this.watch(this.model.get(), 'layout.row', '_renderLayout');
        this.watch(this.model.get(), 'layout.column', '_renderLayout');
        // 表单
        this.watch(this.model.get(), 'formElementsString', '_renderLayout');
        //
        this.watch(this.model.get(), 'verifyTipsType', '_renderLayout');
        //
        this.watch(this.model.get(), 'formTitle', '_renderLayout');
        // 渲染表单设计界面
        this.output('container', {
            componentSelector: {
                list: this.model.get('components'),
                openId: ''
            }
        });
    };

    /**
     * 打开组件选择下拉菜单
     * @param e
     * @private
     */
    this._openComponentSelector = function(e) {
        var id = this.$(e).attr('data-id');
        if (id) {
            this.model.set('openComponentId', id);
        } else {
            // 打开全局设置
            this.model.set('openPropertyTemp', 'global');
            this.model.set('openProperty', 'global');
        }
    };

    /**
     * 渲染组件选择界面
     * @private
     */
    this._renderComponentSelector = function() {
        this.output('component', {
            list: this.model.get('components'),
            openId: this.model.get('openComponentId')
        }, $('.form-designer-component-selector'));
    };

    /**
     * 渲染布局
     * @private
     */
    this._renderLayout = function() {
        var row = this.model.get('layout.row'),
            column = this.model.get('layout.column'),
            formElements = this.model.get('formElements'),
            formTitle = this.model.get('formTitle'),
            openProperty = this.model.get('openPropertyTemp'),
            verifyTipsType = this.model.get('verifyTipsType');

        var data = {
            row: row,
            column: column,
            formElements: formElements,
            formTitle: formTitle,
            componentData: {},
            openProperty: openProperty ? openProperty : '',
            verifyTipsType: verifyTipsType
        };
        //
        // for (var i in formElements) {
        //     if (formElements.hasOwnProperty(i)) {
        //         var properties = formElements[i].property,
        //             rules = formElements[i].rules;

        //         if (!data.componentData.hasOwnProperty(i)) {
        //             data.componentData[i] = {};
        //         }

        //         for (var j in properties) {
        //             if (properties.hasOwnProperty(j)) {
        //                 data.componentData[i][j] = properties[j];
        //             }
        //         }
        //         for (var m in rules) {
        //             if (rules.hasOwnProperty(m)) {
        //                 data.componentData[i][m] = rules[m];
        //             }
        //         }
        //     }
        // }
        this.output('layout.default', data, $('.form-designer-form'))
    };

    /**
     * 渲染属性设置界面
     * @private
     */
    this._renderProperty = function() {
        var position = self.model.get('openProperty'),
            formElements = self.model.get('formElements'),
            formTtile = self.model.get('formTitle'),
            verifyTipsType = self.model.get('verifyTipsType'),
            name = '',
            data = {
                property: {},
                rules: {},
                verifyTipsType: verifyTipsType,
                formTitle: formTtile
            };

        if (position === 'global') {
            var rowAndColumn = self.model.get('layout');
            data['row'] = rowAndColumn.row;
            data['column'] = rowAndColumn.column;
            self.output('property.global.view', data, $('.form-designer-component-setting'));
        } else {
            if (!formElements.hasOwnProperty(position)) {
                this._renderEmptyProperty();
                return false;
            } else {
                name = formElements[position].name;
                data = {
                    property: formElements[position].property,
                    rules: formElements[position].rules
                };
                self.output('property.layout', {
                    name: 'module.form_designer.property.' + name + '.view',
                    data: data
                }, $('.form-designer-component-setting'));
            }
        }
    };

    /**
     * 浸染空的设置界面
     * @private
     */
    this._renderEmptyProperty = function() {
        self.output('property.empty.view', {}, $('.form-designer-component-setting'));
    };

    /**
     * 拖动组件到表单区域
     * @param e
     * @private
     */
    this._drag = function(e) {
        var target = this.$(e),
            text = target.text(),
            component = target.attr('data-component'),
            _for = target.attr('data-for'),
            key = target.attr('data-key'),
            _body = $('body'),
            area = $('#js-verify-form');

        // 创建拖动浮动层
        _body.append(this.getView('module.form_designer.drag_tip', text));
        //
        var o = $('.form-designer-drag-tip');
        o.css({top: e.clientY + 1, left: e.clientX + 1});
        //
        _body.off('mousemove').on('mousemove', function(e) {
            o.css({top: e.clientY + 1, left: e.clientX + 1});
            e.stopPropagation();
        });
        //
        _body.off('mouseup').on('mouseup', function(e) {
            var element = document.elementFromPoint(e.clientX, e.clientY),
                target = $(element);

            if (component) {
                if (_for === 'form') {
                    if (target.hasClass('form-designer-component-container')) {
                        if (target.children().length === 0) {
                            // 更新数据对象
                            var index = target.attr('data-index'),
                                row = target.attr('data-row'),
                                column = target.attr('data-column'),
                                position = row + '' + column;

                            self.model.set('openPropertyTemp', position);
                            //
                            self.model.setFormElements({
                                name: key,
                                component: component,
                                property: {
                                    class: 'form-designer-component-item js-form-control'
                                },
                                rules: {}
                            }, index, true, row, column);
                            // 渲染property setting
                            self.model.set('openProperty', position);
                        }
                    } else {
                        console.log('通用组件须先有表格布局');
                    }
                }

                if (_for === 'layout') {
                    if (self.inArea) {
                        self.model.setFormElements({
                            name: key,
                            component: component,
                            property: {},
                            rules: {}
                        }, null, true);
                    }
                }
            }
            text = '';
            component = '';
            key = '';
            o.remove();
            e.stopPropagation();
        });
    };

    /**
     * 组件设置事件
     * @type {{inputChange: _settingEvent.inputChange}}
     * @private
     */
    this._settingEvent = {
        /**
         * 文本框值变化
         * @param e
         */
        inputChange: function(e) {
            var name = self.$(e).attr('name'),
                data = {};

            data[name] = $.trim(self.$(e).val());
            self.model.setFormElements(data, true);
        },
        /**
         * 选择框
         * @param e
         */
        selectChange: function(e) {
            var name = self.$(e).attr('name'),
                data = {};

            data[name] = self.$(e).val();
            self.model.setFormElements(data, true);
        },
        /**
         * 单选
         * @param e
         */
        radioClick: function(e) {
            var name = self.$(e).attr('name'),
                data = {};

            data[name] = self.$(e).val();
            self.model.setFormElements(data, true);
        },
        datepickerChange: function(e) {
            var name = self.$(e).attr('name'),
                data = {};

            data[name] = self.$(e).val();
            self.model.setFormElements(data, true);
        },
        /**
         * 删除组件
         */
        delComponent: function() {
            self.model.delComponent();
        },
        /**
         * 测试验证
         */
        verifyTest: function() {
            var message = '<span class="color-danger">校验失败!</span>';
            if (self.callComponent({name: 'verification'})) {
                message = '<span class="color-success">校验成功!</span>';
            }
            $('#js-form-verify-result').html(message);
        },
        formMouseEnter: function(e) {
            var target = self.$(e);
            self.inArea = true;
        },
        formMouseLeave: function(e) {
            var target = self.$(e);
            self.inArea = false;
        },
        editComponent: function(e) {

        }
    }
});