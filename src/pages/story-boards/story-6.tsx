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
  // animateTimeSeries,
  // createTimeSeries,
} from "src/components/story-boards/utils-story-6";

const Story6 = () => {
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState<number>(3);
  const [parameters, setParameters] = useState<string[]>([]);
  const [parameter, setParameter] = useState<string>("");

  const handleSegmentChange = (e) => {
    const newSegment = e.target.value;
    // prettier-ignore
    console.log(`Story6: handleSegmentChange: segment: ${segment}, newSegment: ${newSegment}`,);
    setSegment(newSegment);

    if (segment && parameter) {
      filterData(parameter, newSegment);
      // createTimeSeries("#chartId");
    }
  };

  const handleParameterSelect = (e) => {
    const newParameter = e.target.value;
    // prettier-ignore
    console.log(`Story6: handleParameterSelect: parameter: ${parameter}, newParameter: ${newParameter}`);
    setParameter(newParameter);
    if (segment && newParameter) {
      filterData(newParameter, segment);
      createPlot("#chartId", newParameter);
    }
  };

  const handleBeginningClick = () => {
    // prettier-ignore
    console.log(`Story6: handleBeginningClick:`);
    animatePlot(0);
  };

  const handleBackClick = () => {
    // prettier-ignore
    console.log(`Story6: handleBackClick:`);
    animatePlot(-1);
  };

  const handlePlayClick = () => {
    // prettier-ignore
    console.log(`Story6: handlePlayClick: `);
    animatePlot(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadData();
      setParameters(getParameters());
      setLoading(false);

      // filterData("epochs", 3);
      // createPlot("#chartId");
    };

    try {
      fetchData();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, []);

  // slider formatted value
  const valuetext = (value) => `${value}`;

  return (
    <>
      <Head>
        <title>Story-6</title>
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
                title="Story-6"
                subheader="Choose a ..."
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
                      {/* <InputLabel
                        sx={{ m: 1, mt: 0 }}
                        id="segment-slider-label"
                      >
                        Set segment value
                      </InputLabel>
                      <FormControl
                        sx={{ m: 1, width: 300, mt: 0 }}
                        size="small"
                      >
                        <Slider
                          // labelId="segment-slider"
                          aria-label="Segments"
                          // defaultValue={3}
                          getAriaValueText={valuetext}
                          step={1}
                          marks
                          min={0}
                          max={5}
                          valueLabelDisplay="auto"
                          value={segment}
                          onChange={handleSegmentChange}
                        />
                      </FormControl> */}

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

                    <div id="chartId" />
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

export default Story6;
