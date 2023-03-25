import { Card, CardContent, Typography } from "@mui/material";

export default function DisplayAccuracyCard({ title, obj, color }) {
  return (
    <div>
      <Card elevation={1} sx={{ minWidth: 180 }}>
        <CardContent>
          <Typography sx={{ fontSize: 12 }} color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5" component="div" color={color}>
            {obj && `${Math.round(obj?.y * 100)}%`}
          </Typography>
          <Typography variant="body2" component="div">
            {obj && `Channels: ${obj?.channels}`}
          </Typography>
          <Typography variant="body2" component="div">
            {obj && `Kernel size: ${obj?.kernel_size}`}
          </Typography>
          <Typography variant="body2" component="div">
            {obj && `Layers: ${obj?.layers}`}
          </Typography>
          <Typography variant="body2" component="div">
            {obj && `Samples/class: ${obj?.samples_per_class}`}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}
