import { useEffect, useReducer, useState } from "react";
import Head from "next/head";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  FormControl,
  FormGroup,
  InputLabel,
  LinearProgress,
  MenuItem,
  OutlinedInput,
  Select,
  Fade,
  Grid,
  Typography,
} from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import { blue } from "@mui/material/colors";
import DashboardLayout from "src/components/dashboard-layout/DashboardLayout";
import {
  loadData,
  getParameters,
  filterData,
  createPlot,
  animatePlot,
  getTestingAccuracy,
  getTrainingAccuracy,
} from "src/components/story-boards/story-7-data";

const Story7 = () => {
  const [loading, setLoading] = useState(true);
  const [parameters, setParameters] = useState<string[]>([]);
  const [parameter, setParameter] = useState<string>("");
  const [testingAccuracy, setTestingAccuracy] = useState<[number, number]>([
    0, 0,
  ]);
  const [trainingAccuracy, setTrainingAccuracy] = useState<[number, number]>([
    0, 0,
  ]);

  const handleParameterSelect = (e) => {
    const newParameter = e.target.value;
    setParameter((d) => newParameter);
    // prettier-ignore
    console.log(`Story7: handleParameterSelect: parameter: ${parameter}, newParameter: ${newParameter}`);

    if (newParameter) {
      filterData(newParameter);
      setTestingAccuracy((d) => getTestingAccuracy());
      setTrainingAccuracy((d) => getTrainingAccuracy());

      // prettier-ignore
      // console.log(`Story7: handleParameterSelect: min: ${min}, max: ${max} | ${minTestingAccuracy()}, ${maxTestingAccuracy()}`);
      createPlot("#chartId");
    }
  };

  const handleBeginningClick = () => {
    // prettier-ignore
    console.log(`Story7: handleBeginningClick:`);
    animatePlot("beginning");
  };

  const handleBackClick = () => {
    // prettier-ignore
    console.log(`Story7: handleBackClick:`);
    animatePlot("back");
  };

  const handlePlayClick = () => {
    // prettier-ignore
    console.log(`Story7: handlePlayClick: `);
    animatePlot("play");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadData();
      setParameters(getParameters());
      setLoading(false);

      // filterData("kernel_size"); // debug
      // createPlot("#chartId");
    };

    try {
      fetchData();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Story-7</title>
      </Head>
      <DashboardLayout>
        <Box
          sx={{
            backgroundColor: "background.default",
            minHeight: "100%",
            py: 8,
          }}
        >
          <Container>
            <Card sx={{ minWidth: 1200 }}>
              <CardHeader
                avatar={
                  <Avatar style={{ backgroundColor: blue[500] }}>
                    <AutoStoriesIcon />
                  </Avatar>
                }
                title="Story-7"
                subheader="Choose a hyperparameter, and click play to animate the story."
              />
              <CardContent sx={{ pt: "8px" }}>
                {loading ? (
                  <Box sx={{ height: 40 }}>
                    <Fade
                      in={loading}
                      style={{
                        transitionDelay: loading ? "800ms" : "0ms",
                      }}
                      unmountOnExit
                    >
                      <LinearProgress />
                    </Fade>
                  </Box>
                ) : (
                  <>
                    <FormGroup
                      sx={{
                        flexDirection: {
                          xs: "column",
                          sm: "row",
                          alignItems: "center",
                        },
                      }}
                    >
                      <FormControl
                        sx={{ m: 1, width: 300, mt: 0 }}
                        size="small"
                      >
                        <InputLabel id="select-region-label">
                          Select parameter
                        </InputLabel>
                        <Select
                          labelId="select-region-label"
                          id="select-region-label"
                          displayEmpty
                          input={<OutlinedInput label="Select region" />}
                          value={parameter}
                          onChange={handleParameterSelect}
                        >
                          {parameters.map((d) => (
                            <MenuItem key={d} value={d}>
                              {d}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl sx={{ m: 1, width: 100, mt: 0 }}>
                        <Button
                          variant="contained"
                          disabled={!parameter}
                          onClick={handleBeginningClick}
                          component="span"
                        >
                          Beginning
                        </Button>
                      </FormControl>

                      <FormControl sx={{ m: 1, width: 100, mt: 0 }}>
                        <Button
                          variant="contained"
                          disabled={!parameter}
                          onClick={handleBackClick}
                          startIcon={<ArrowBackIosIcon />}
                          component="span"
                        >
                          Back
                        </Button>
                      </FormControl>

                      <FormControl sx={{ m: 1, width: 100, mt: 0 }}>
                        <Button
                          variant="contained"
                          disabled={!parameter}
                          onClick={handlePlayClick}
                          endIcon={<ArrowForwardIosIcon />}
                          component="span"
                        >
                          Play
                        </Button>
                      </FormControl>
                    </FormGroup>

                    <Grid container spacing={0}>
                      <Grid xs={1}>
                        <Grid xs={12} rowSpacing={1}>
                          <Card sx={{ minWidth: 180 }}>
                            <CardContent>
                              <Typography
                                sx={{ fontSize: 12 }}
                                color="text.secondary"
                                gutterBottom
                              >
                                Testing Accuracy
                              </Typography>
                              <Typography
                                variant="h5"
                                component="div"
                                color="#33eb91"
                              >
                                Max: {testingAccuracy[1]}%
                              </Typography>
                              <Typography
                                variant="h6"
                                component="div"
                                color="#f73378"
                              >
                                Min: {testingAccuracy[0]}%
                              </Typography>
                              {/* <Typography variant="body2">
                                Hyperparameter: {parameter}
                              </Typography> */}
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid xs={12} rowSpacing={1}>
                          <Card sx={{ minWidth: 180 }}>
                            <CardContent>
                              <Typography
                                sx={{ fontSize: 12 }}
                                color="text.secondary"
                                gutterBottom
                              >
                                Training Accuracy
                              </Typography>
                              <Typography
                                variant="h5"
                                component="div"
                                color="#33eb91"
                              >
                                Max: {trainingAccuracy[1]}%
                              </Typography>
                              <Typography
                                variant="h6"
                                component="div"
                                color="#f73378"
                              >
                                Min: {trainingAccuracy[0]}%
                              </Typography>

                              {/* <Typography variant="body2">
                                Hyperparameter: {parameter}
                              </Typography> */}
                            </CardContent>
                          </Card>
                        </Grid>
                        {/* <Grid xs={12}>3</Grid> */}
                      </Grid>
                      <Grid xs={1}> </Grid>
                      <Grid xs={10}>
                        <Card sx={{ minWidth: 275 }}>
                          <CardContent>
                            <div id="chartId" />
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </>
                )}
              </CardContent>
            </Card>
          </Container>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default Story7;
