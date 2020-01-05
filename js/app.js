const {
    Button,
    TextField,
    FormControl,
    FormHelperText,
    InputLabel,
    Input,
    InputAdornment,
    IconButton,
    Icon,
    Select,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    Grid,
    TextareaAutosize
} = MaterialUI;
// Obtain the root element
const rootAppElement = document.getElementById("configurator_app");
const colors = ["blue", "orange", "red"];
const columnNames = ["Input plugins", "Intermediate plugins", "Output plugins"];
const moduleSchemas = [
    [jsonSchemaUDP, jsonSchemaTCP],
    [jsonSchemaAnonymization],
    [jsonSchemaJSON, jsonSchemaDummy, jsonSchemaLNF, jsonSchemaUniRec]
];
const defaultConfig = {
    ipfixcol2: {
        inputPlugins: {
            input: []
        },
        intermediatePlugins: {
            intermediate: []
        },
        outputPlugins: {
            output: []
        }
    }
};

const x2js = new X2JS();

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <Form />;
    }
}

class Form extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modules: [[], [], []],
            overlay: null
        };
    }

    findSchema(module, schemas) {
        var moduleSchema = schemas.find(schema => module.plugin === schema.properties.plugin.const);
        if (moduleSchema !== undefined) {
            return moduleSchema;
        }
        console.log("Schema not found!");
    }

    editCancel() {
        this.setState({
            overlay: null
        });
        console.log("Editing canceled");
    }

    newModuleOverlay(columnIndex, moduleIndex) {
        this.setState({
            overlay: (
                <Overlay
                    columnIndex={columnIndex}
                    jsonSchema={moduleSchemas[columnIndex][moduleIndex]}
                    onCancel={this.editCancel.bind(this)}
                    onSuccess={this.addModule.bind(this)}
                />
            )
        });
        console.log("Editing a new module");
    }

    editModuleOverlay(columnIndex, index) {
        var module = JSON.parse(JSON.stringify(this.state.modules[columnIndex][index]));
        var jsonSchema = this.findSchema(module, moduleSchemas[columnIndex]);
        this.setState({
            overlay: (
                <Overlay
                    module={module}
                    columnIndex={columnIndex}
                    index={index}
                    jsonSchema={jsonSchema}
                    onCancel={this.editCancel.bind(this)}
                    onSuccess={this.editModule.bind(this)}
                />
            )
        });
        console.log("Editing an existing module");
    }

    addModule(columnIndex, module) {
        var modules = this.state.modules;
        modules[columnIndex] = modules[columnIndex].concat(module);
        this.setState({
            modules: modules,
            overlay: null
        });
        console.log("New module added");
    }

    editModule(columnIndex, index, module) {
        var modules = this.state.modules;
        modules[columnIndex][index] = module;
        this.setState({
            modules: modules,
            overlay: null
        });
        console.log("Module edited");
    }

    removeModule(columnIndex, index) {
        var modules = this.state.modules;
        modules[columnIndex].splice(index, 1);
        this.setState({
            modules: modules
        });
        console.log("Module removed");
    }

    renderXML() {
        var config = defaultConfig;
        config.ipfixcol2.inputPlugins.input = this.state.modules[0];
        config.ipfixcol2.intermediatePlugins.intermediate = this.state.modules[1];
        config.ipfixcol2.outputPlugins.output = this.state.modules[2];
        var xml = x2js.json2xml_str(config);
        return (
            <FormControl fullWidth>
                <TextField
                    label={"Config XML"}
                    multiline
                    InputProps={{
                        readOnly: true
                    }}
                    value={formatXml(xml)}
                />
                <FormHelperText>Read only</FormHelperText>
            </FormControl>
        );
    }

    render() {
        return (
            <div className="form">
                {this.state.overlay}
                <div className="mainLayer">
                    <FormColumn
                        key={columnNames[0]}
                        columnIndex={0}
                        modules={this.state.modules[0]}
                        color={colors[0]}
                        name={columnNames[0]}
                        modulesAvailable={moduleSchemas[0]}
                        addModule={this.newModuleOverlay.bind(this)}
                        editModule={this.editModuleOverlay.bind(this)}
                        removeModule={this.removeModule.bind(this)}
                    />
                    <FormColumn
                        key={columnNames[1]}
                        columnIndex={1}
                        modules={this.state.modules[1]}
                        color={colors[1]}
                        name={columnNames[1]}
                        modulesAvailable={moduleSchemas[1]}
                        addModule={this.newModuleOverlay.bind(this)}
                        editModule={this.editModuleOverlay.bind(this)}
                        removeModule={this.removeModule.bind(this)}
                    />
                    <FormColumn
                        key={columnNames[2]}
                        columnIndex={2}
                        modules={this.state.modules[2]}
                        color={colors[2]}
                        name={columnNames[2]}
                        modulesAvailable={moduleSchemas[2]}
                        addModule={this.newModuleOverlay.bind(this)}
                        editModule={this.editModuleOverlay.bind(this)}
                        removeModule={this.removeModule.bind(this)}
                    />
                    {this.renderXML()}
                </div>
            </div>
        );
    }
}

class FormColumn extends React.Component {
    addModule(moduleIndex) {
        this.props.addModule(this.props.columnIndex, moduleIndex);
    }

    removeModule(index) {
        this.props.removeModule(this.props.columnIndex, index);
    }

    editModule(index) {
        this.props.editModule(this.props.columnIndex, index);
    }

    render() {
        return (
            <div className={"column " + this.props.color}>
                <h2>{this.props.name}</h2>
                {this.props.modules.map((module, index) => {
                    return (
                        <Module
                            key={index}
                            index={index}
                            module={module}
                            onRemove={this.removeModule.bind(this)}
                            onEdit={this.editModule.bind(this)}
                        />
                    );
                })}
                <div className={"addModule"} id={"add" + this.props.name}>
                    <button>Add plugin</button>
                    <div className={"modules"}>
                        {this.props.modulesAvailable.map((moduleAvailable, index) => {
                            return (
                                <ModuleAvailable
                                    key={index}
                                    moduleIndex={index}
                                    module={moduleAvailable}
                                    onAdd={this.addModule.bind(this)}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

class ModuleAvailable extends React.Component {
    handleAdd() {
        this.props.onAdd(this.props.moduleIndex);
    }

    render() {
        return (
            <button onClick={this.handleAdd.bind(this)}>
                {this.props.module.properties.plugin.const}
            </button>
        );
    }
}

class Module extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            detailVisible: false
        };
    }

    handleEdit() {
        this.props.onEdit(this.props.index);
    }

    setDetailVisibile() {
        this.setState({ detailVisible: true });
        console.log("set visible");
    }

    setDetailHidden() {
        this.setState({ detailVisible: false });
        console.log("set hidden");
    }

    render() {
        return (
            <div className={"module" + (this.state.detailVisible ? " visible" : "")}>
                <div className={"header"}>
                    <button
                        onClick={
                            this.state.detailVisible
                                ? () => this.setDetailHidden()
                                : () => this.setDetailVisibile()
                        }
                    >
                        <i className={"fas fa-angle-down"}></i>
                    </button>
                    <h3>{this.props.module.name}</h3>
                    <div>
                        <button onClick={this.handleEdit.bind(this)}>
                            <i className="fas fa-pen"></i>
                        </button>
                        <button onClick={this.props.onRemove}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div className={"content"}>
                    <p>plugin: {this.props.module.plugin}</p>
                    <p>params: {this.props.module.params.toString()}</p>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(<App />, rootAppElement);
