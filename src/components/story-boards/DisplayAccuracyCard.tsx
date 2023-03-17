import { Card, CardContent, Typography } from "@mui/material";

export default function DisplayAccuracyCard({ title, val }) {
  return (
    <div>
      <Card elevation={1} sx={{ minWidth: 180 }}>
        <CardContent>
          <Typography sx={{ fontSize: 12 }} color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5" component="div" color="#33eb91">
            Max: {val[1]}%
          </Typography>
          <Typography variant="h6" component="div" color="#ffac33">
            Min: {val[0]}%
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}
