import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const FeatureActionTableDialog = ({ open, onClose, onSave, rowData }) => {
  const [formData, setFormData] = useState(rowData || {});
  const [featureParams, setFeatureParams] = useState([{ key: "", value: "" }]);
  const [actionParams, setActionParams] = useState([{ key: "", value: "" }]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFeatureParamChange = (index, key, value) => {
    const updatedParams = [...featureParams];
    updatedParams[index][key] = value;
    setFeatureParams(updatedParams);
  };

  const handleActionParamChange = (index, key, value) => {
    const updatedParams = [...actionParams];
    updatedParams[index][key] = value;
    setActionParams(updatedParams);
  };

  const handleAddFeatureParam = () => {
    setFeatureParams([...featureParams, { key: "", value: "" }]);
  };

  const handleAddActionParam = () => {
    setActionParams([...actionParams, { key: "", value: "" }]);
  };

  const handleSave = () => {
    const updatedFormData = {
      ...formData,
      FeatureParams: featureParams.reduce((acc, param) => {
        if (param.key && param.value) {
          acc[param.key] = param.value;
        }
        return acc;
      }, {}),
      ActionParams: actionParams.reduce((acc, param) => {
        if (param.key && param.value) {
          acc[param.key] = param.value;
        }
        return acc;
      }, {}),
    };
    onSave(updatedFormData);
    setFormData({});
    setFeatureParams([{ key: "", value: "" }]);
    setActionParams([{ key: "", value: "" }]);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{rowData ? "Edit Row" : "Add New Row"}</DialogTitle>
      <DialogContent>
        <TextField
          name="ID"
          label="ID"
          value={formData.ID || ""}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Feature</InputLabel>
          <Select
            name="Feature"
            value={formData.Feature || ""}
            onChange={handleChange}
          >
            {/* Replace the following MenuItem components with your selectable features */}
            <MenuItem value="Feature A">Feature A</MenuItem>
            <MenuItem value="Feature B">Feature B</MenuItem>
            <MenuItem value="Feature C">Feature C</MenuItem>
          </Select>
        </FormControl>
        <TextField
          name="Rank"
          label="Rank"
          type="number"
          value={formData.Rank || ""}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Action</InputLabel>
          <Select
            name="Action"
            value={formData.Action || ""}
            onChange={handleChange}
          >
            {/* Replace the following MenuItem components with your selectable actions */}
            <MenuItem value="Action A">Action A</MenuItem>
            <MenuItem value="Action B">Action B</MenuItem>
            <MenuItem value="Action C">Action C</MenuItem>
          </Select>
        </FormControl>

        {/* FeatureParams fields for key-value pairs */}
        {featureParams.map((param, index) => (
          <div key={index} style={{ display: "flex", marginBottom: "8px" }}>
            <TextField
              label="Key"
              value={param.key}
              onChange={(e) =>
                handleFeatureParamChange(index, "key", e.target.value)
              }
              style={{ marginRight: "8px" }}
            />
            <TextField
              label="Value"
              value={param.value}
              onChange={(e) =>
                handleFeatureParamChange(index, "value", e.target.value)
              }
              style={{ marginRight: "8px" }}
            />
          </div>
        ))}
        <IconButton onClick={handleAddFeatureParam}>
          <AddIcon />
        </IconButton>

        {/* ActionParams fields for key-value pairs */}
        {actionParams.map((param, index) => (
          <div key={index} style={{ display: "flex", marginBottom: "8px" }}>
            <TextField
              label="Key"
              value={param.key}
              onChange={(e) =>
                handleActionParamChange(index, "key", e.target.value)
              }
              style={{ marginRight: "8px" }}
            />
            <TextField
              label="Value"
              value={param.value}
              onChange={(e) =>
                handleActionParamChange(index, "value", e.target.value)
              }
              style={{ marginRight: "8px" }}
            />
          </div>
        ))}
        <IconButton onClick={handleAddActionParam}>
          <AddIcon />
        </IconButton>

        <TextField
          name="Text"
          label="Text"
          value={formData.Text || ""}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="Comment"
          label="Comment"
          value={formData.Comment || ""}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>{rowData ? "Update" : "Save"}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeatureActionTableDialog;
