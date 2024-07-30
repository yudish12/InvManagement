import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { debounce } from "@mui/material/utils";
import { CircularProgress } from "@mui/material";

function FormAsyncSelect({ id, value, onChange, label, loadOptions, required, error, helperText, ...restProps }) {
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetch = React.useMemo(
    () =>
      debounce(async ({ inputValue }) => {
        setLoading(true);
        const _opts = await loadOptions(inputValue);
        setOptions(_opts);
        setLoading(false);
      }, 400),
    []
  );

  React.useEffect(() => {
    fetch({ inputValue });
  }, [inputValue, fetch]);

  return (
    <Autocomplete
      id={id || `async-select-${Math.random() * 100}`}
      filterOptions={(x) => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={value}
      onChange={onChange}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={!!required}
          error={error ? error : undefined}
          helperText={helperText ? helperText : undefined}
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      //   renderOption={(props, option) => {
      //     const matches = option.structured_formatting.main_text_matched_substrings || [];

      //     const parts = parse(
      //       option.structured_formatting.main_text,
      //       matches.map((match) => [match.offset, match.offset + match.length])
      //     );

      //     return (
      //       <li {...props}>
      //         <Grid container alignItems="center">
      //           <Grid item sx={{ display: "flex", width: 44 }}>
      //             <LocationOnIcon sx={{ color: "text.secondary" }} />
      //           </Grid>
      //           <Grid item sx={{ width: "calc(100% - 44px)", wordWrap: "break-word" }}>
      //             {parts.map((part, index) => (
      //               <Box key={index} component="span" sx={{ fontWeight: part.highlight ? "bold" : "regular" }}>
      //                 {part.text}
      //               </Box>
      //             ))}
      //             <Typography variant="body2" color="text.secondary">
      //               {option.structured_formatting.secondary_text}
      //             </Typography>
      //           </Grid>
      //         </Grid>
      //       </li>
      //     );
      //   }}
      {...restProps}
    />
  );
}

export default FormAsyncSelect;
